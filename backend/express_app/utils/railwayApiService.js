const axios = require('axios');

// Station code mapping for cities used in the frontend
const stationMapping = {
    "Agra": "AGC",
    "Ahmedabad": "ADI",
    "Ajmer": "AII",
    "Allahabad": "PRYJ",
    "Amritsar": "ASR",
    "Bangalore": "SBC",
    "Bhopal": "BPL",
    "Bhubaneswar": "BBS",
    "Bilaspur": "BSP",
    "Chandigarh": "CDG",
    "Chennai": "MAS",
    "Coimbatore": "CBE",
    "Dehradun": "DDN",
    "Dhanbad": "DHN",
    "Ernakulam": "ERS",
    "Gaya": "GAYA",
    "Gorakhpur": "GKP",
    "Guntur": "GNT",
    "Guwahati": "GHY",
    "Gwalior": "GWL",
    "Haridwar": "HW",
    "Hyderabad": "HYB",
    "Indore": "INDB",
    "Jabalpur": "JBP",
    "Jaipur": "JP",
    "Jammu": "JAT",
    "Jhansi": "VGLJ",
    "Jodhpur": "JU",
    "Kanpur": "CNB",
    "Kolkata": "HWH",
    "Kota": "KOTA",
    "Lucknow": "LKO",
    "Ludhiana": "LDH",
    "Madurai": "MDU",
    "Mumbai": "CSMT",
    "Nagpur": "NGP",
    "New Delhi": "NDLS",
    "Patna": "PNBE",
    "Pune": "PUNE",
    "Raipur": "R",
    "Rajkot": "RJT",
    "Ranchi": "RNC",
    "Secunderabad": "SC",
    "Shimla": "SML",
    "Surat": "ST",
    "Tatanagar": "TATA",
    "Thiruvananthapuram": "TVC",
    "Tirupati": "TPTY",
    "Udaipur": "UDZ",
    "Vadodara": "BRC",
    "Varanasi": "BSB",
    "Visakhapatnam": "VSKP",
    "Vijayawada": "BZA"
};

/**
 * Converts schedule time (minutes from midnight) to a proper Date ISO string.
 * addDays is offset from today (0-based).
 */
function convertMinutesToDateString(minutes, addDays = 0) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const now = new Date();
    now.setHours(hours, mins, 0, 0);
    if (addDays) {
        now.setDate(now.getDate() + addDays);
    }
    return now.toISOString();
}

/**
 * Service to fetch live train data from RailRadar API.
 * Official docs: https://railradar.in/docs/trains-between-stations
 * Endpoint: GET https://api.railradar.in/v1/trains/between/{from}/{to}
 * Auth: Authorization: Bearer rr_...
 */
const searchLiveTrains = async (source, destination, date) => {
    try {
        const apiKey = process.env.RAILRADAR_API_KEY;
        if (!apiKey) {
            console.log('No RailRadar API Key found. Falling back to DB.');
            return null;
        }

        const fromCode = stationMapping[source] || source;
        const toCode = stationMapping[destination] || destination;

        if (!fromCode || !toCode) {
            console.log('Missing source or destination station code. Falling back to DB.');
            return null;
        }

        // Build the correct path-based URL: /v1/trains/between/{from}/{to}
        const apiUrl = `https://api.railradar.in/v1/trains/between/${encodeURIComponent(fromCode)}/${encodeURIComponent(toCode)}`;

        // Build query params — date must be YYYY-MM-DD format
        const queryParams = {};
        if (date) {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                // Format: YYYY-MM-DD
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                queryParams.date = `${year}-${month}-${day}`;
            }
        }

        console.log(`Calling RailRadar API: ${apiUrl}`, queryParams);

        const response = await axios.get(apiUrl, {
            params: queryParams,
            headers: {
                // Correct auth header: Bearer token scheme
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            timeout: 8000
        });

        console.log('RailRadar API response status:', response.status);
        console.log('RailRadar response:', JSON.stringify(response.data, null, 2));

        const payload = response.data.data || response.data;
        const trains = payload.trains || payload.data || [];

        if (Array.isArray(trains)) {

            console.log(`RailRadar returned ${trains.length} trains.`);

            if (trains.length === 0) return null;

            return trains.map(t => ({
                _id: `live_${t.train?.number || t.number || t.trainNumber}`,
                name: t.train?.name || t.name || t.trainName || 'Unknown Train',
                number: t.train?.number || t.number || t.trainNumber,
                source: t.from?.name || source,
                destination: t.to?.name || destination,
                departureTime: (() => {
                    const dt = new Date(date || Date.now());
                    const [h, m] = (t.from?.departure || '10:00').split(':').map(Number);
                    dt.setHours(h, m, 0, 0);
                    dt.setDate(dt.getDate() + ((t.from?.day || 1) - 1));
                    return dt.toISOString();
                })(),
                arrivalTime: (() => {
                    const at = new Date(date || Date.now());
                    const [h, m] = (t.to?.arrival || '20:00').split(':').map(Number);
                    at.setHours(h, m, 0, 0);
                    at.setDate(at.getDate() + ((t.to?.day || 1) - 1));
                    return at.toISOString();
                })(),
                totalSeats: 400,
                availableSeats: Math.floor(Math.random() * 150) + 10,
                basePrice: 500,
                isLive: true
            }));
        }

        console.log('RailRadar API returned no valid data, falling back to DB.');
        return null;
    } catch (error) {
        console.error('RailRadar API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        // Gracefully fall back to DB
        return null;
    }
};

const getLiveStatus = async (trainNumber) => {
    const generateMockStatus = (tn) => {
        const statuses = ["On Time", "Slight Delay", "Running Late", "Halted at Signal"];
        const locations = ["Agra Cantt", "Bhopal Jn", "Itarsi Jn", "Nagpur", "Balharshah", "Vijayawada Jn"];
        const nextLocations = ["Bhopal Jn", "Itarsi Jn", "Nagpur", "Balharshah", "Vijayawada Jn", "Chennai Central"];

        const locIdx = Math.floor(Math.random() * locations.length);
        const isBetween = Math.random() > 0.5;

        let currentLocation = locations[locIdx];
        let statusMessage = statuses[Math.floor(Math.random() * statuses.length)];

        if (isBetween) {
            currentLocation = `Running between ${locations[locIdx]} and ${nextLocations[locIdx]}`;
            statusMessage = "En Route";
        }

        return {
            trainNumber: tn,
            currentLocation,
            delayMinutes: Math.floor(Math.random() * 45),
            statusMessage,
            lastUpdated: new Date().toLocaleString()
        };
    };

    try {
        const apiKey = process.env.RAILRADAR_API_KEY;
        if (!apiKey) return generateMockStatus(trainNumber);

        // Correct live status endpoint: GET /v1/trains/{number}/live
        const apiUrl = `https://api.railradar.in/v1/trains/${trainNumber}/live`;
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        });

        console.log('Live status response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.success && response.data.data) {
            const d = response.data.data;
            return {
                trainNumber,
                currentLocation: d.currentStation?.name || d.currentStationName || "En Route",
                delayMinutes: d.delayMinutes || d.delayInMinutes || 0,
                statusMessage: d.status || d.statusAsOf || "Running on time",
                lastUpdated: new Date().toLocaleString()
            };
        }
        return generateMockStatus(trainNumber);
    } catch (e) {
        return generateMockStatus(trainNumber);
    }
};

module.exports = {
    searchLiveTrains,
    getLiveStatus
};
