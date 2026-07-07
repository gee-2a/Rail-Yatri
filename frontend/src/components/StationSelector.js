import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { INDIAN_STATIONS } from '@/lib/stationData';

export default function StationSelector({ value, onChange, placeholder = "Select station..." }) {
  const [open, setOpen] = useState(false);

  const selectedStation = INDIAN_STATIONS.find(s => 
    s.name.toLowerCase() === (value || '').toLowerCase() || 
    s.code.toLowerCase() === (value || '').toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white text-[#0A0A0A] border-[#E5E5E5] px-4 py-3 h-12 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-left flex items-center"
        >
          <span className="truncate flex-1">
            {selectedStation ? `${selectedStation.name} (${selectedStation.code})` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-white border border-[#E5E5E5] shadow-2xl rounded-xl z-[9999]" align="start">
        <Command className="bg-white">
          <CommandInput placeholder="Search city or station code..." className="text-[#0A0A0A] placeholder:text-[#6C757D]" />
          <CommandList className="max-h-[250px] overflow-y-auto p-1">
            <CommandEmpty className="py-6 text-center text-sm text-[#6C757D]">No station found.</CommandEmpty>
            <CommandGroup heading="Major Indian Cities" className="text-xs text-[#6C757D] font-semibold px-2 py-1.5">
              {INDIAN_STATIONS.map((station) => (
                <CommandItem
                  key={station.code}
                  value={`${station.name} ${station.code}`}
                  onSelect={() => {
                    onChange(station.name);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 text-sm text-[#0A0A0A] cursor-pointer hover:bg-gray-100 rounded-lg transition-colors data-[selected=true]:bg-gray-100"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{station.name}</span>
                    <span className="text-[11px] text-[#6C757D]">{station.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] px-2 py-0.5 rounded">
                      {station.code}
                    </span>
                    {value && value.toLowerCase() === station.name.toLowerCase() && (
                      <Check className="h-4 w-4 text-[#E63946]" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
