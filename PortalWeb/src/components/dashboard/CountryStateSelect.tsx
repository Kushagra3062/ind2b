"use client"

import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Country, State } from "country-state-city"

interface CountryStateSelectProps {
  selectedCountry: string
  selectedState: string
  onCountryChange: (value: string) => void
  onStateChange: (value: string) => void
  label: string
}

export function CountryStateSelect({
  selectedCountry,
  selectedState,
  onCountryChange,
  onStateChange,
  label,
}: CountryStateSelectProps) {
  const [open, setOpen] = useState(false)
  const [stateOpen, setStateOpen] = useState(false)
  const [countries] = useState(Country.getAllCountries())
  const [states, setStates] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Set default country to India on mount
  useEffect(() => {
    if (!selectedCountry) {
      const india = countries.find((country) => country.isoCode === "IN")
      if (india) {
        onCountryChange(india.isoCode)
      }
    }
  }, [countries, onCountryChange, selectedCountry])

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry))
    } else {
      setStates([])
    }
  }, [selectedCountry])

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
            {selectedCountry
              ? countries.find((country) => country.isoCode === selectedCountry)?.name
              : `Select ${label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.isoCode}
                    value={country.name}
                    onSelect={() => {
                      onCountryChange(country.isoCode)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedCountry === country.isoCode ? "opacity-100" : "opacity-0")}
                    />
                    {country.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {states.length > 0 && (
        <Popover open={stateOpen} onOpenChange={setStateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={stateOpen} className="justify-between">
              {selectedState ? states.find((state) => state.isoCode === selectedState)?.name : "Select state"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search state..." />
              <CommandList>
                <CommandEmpty>No state found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {states.map((state) => (
                    <CommandItem
                      key={state.isoCode}
                      value={state.name}
                      onSelect={() => {
                        onStateChange(state.isoCode)
                        setStateOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedState === state.isoCode ? "opacity-100" : "opacity-0")}
                      />
                      {state.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
