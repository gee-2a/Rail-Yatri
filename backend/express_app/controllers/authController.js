const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Hard-coded admin credentials — only these emails can have the 'admin' role
const ADMIN_CREDENTIALS = [
    { email: 'admin@railyatri.com',        password: 'password123', name: 'Global Admin' },
    { email: 'daspratyusha101@gmail.com', password: 'pd1901', name: 'Pratyusha Das' },
    { email: 'khushidas0119@gmail.com',    password: 'kd1901', name: 'Khushi Das'    },
    { email: 'sessionchairparallelsession14@gmail.com', password: 'sc1901', name: 'Session Chair' },
    { email: 'finaladmin@railyatri.com', password: 'password123', name: 'Final Admin' },
];

const ALLOWED_ADMIN_EMAILS = ADMIN_CREDENTIALS.map(a => a.email);

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Block public registration for admin-reserved emails
        if (ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
            return res.status(403).json({ message: 'This email is reserved for admin use. Please use the login form.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'user'
        });

        res.status(201).json({
            _id: user.id, name: user.name, email: user.email, role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailLower = email.toLowerCase();

        // Check if this is one of the hardcoded admin accounts
        const adminCred = ADMIN_CREDENTIALS.find(a => a.email === emailLower);
        if (adminCred) {
            // Validate password against hardcoded value
            if (password !== adminCred.password) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            // Auto-provision admin in DB if they don't exist yet
            let adminUser = await User.findOne({ email: emailLower });
            if (!adminUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(adminCred.password, salt);
                adminUser = await User.create({
                    name: adminCred.name, email: emailLower,
                    password: hashedPassword, role: 'admin'
                });
            } else {
                // Ensure existing record has admin role
                if (adminUser.role !== 'admin') {
                    adminUser.role = 'admin';
                    await adminUser.save();
                }
            }
            return res.json({
                _id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin',
                token: generateToken(adminUser.id, 'admin')
            });
        }

        // Normal user login
        const user = await User.findOne({ email: emailLower });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id, name: user.name, email: user.email, role: user.role,
                token: generateToken(user.id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if updating email to one that already exists
        if (req.body.email && req.body.email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            // Auto provisioned email verification can be added here
            // Block admin reservation email public updates
            const ADMIN_CREDENTIALS = [
                { email: 'admin@railyatri.com' },
                { email: 'daspratyusha101@gmail.com' },
                { email: 'khushidas0119@gmail.com' },
                { email: 'sessionchairparallelsession14@gmail.com' },
                { email: 'finaladmin@railyatri.com' }
            ];
            if (ADMIN_CREDENTIALS.some(a => a.email === req.body.email.toLowerCase())) {
                return res.status(403).json({ message: 'This email is reserved for admin use.' });
            }
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email ? req.body.email.toLowerCase() : user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser.id, updatedUser.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


