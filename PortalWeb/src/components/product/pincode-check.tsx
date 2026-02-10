"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Result = { status: "idle" } | { status: "valid"; city: string } | { status: "invalid"; reason: string }

const METRO_PREFIXES: Record<string, string[]> = {
  // City: List of 3-digit PIN prefixes (India PINs are 6 digits)
  Delhi: ["110"],
  Mumbai: ["400"],
  Bengaluru: ["560"],
  Chennai: ["600"],
  Kolkata: ["700"],
  Hyderabad: ["500"],
  Pune: ["411"],
  Ahmedabad: ["380"],
}

function checkMetroPincode(pin: string): Result {
  const normalized = pin.trim()
  if (!/^\d{6}$/.test(normalized)) {
    return { status: "invalid", reason: "Please enter a valid 6‑digit pincode." }
  }

  const prefix = normalized.slice(0, 3)
  for (const [city, prefixes] of Object.entries(METRO_PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return { status: "valid", city }
    }
  }
  return {
    status: "invalid",
    reason: "Delivery is currently available only in metropolitan cities. This pincode is outside our service area.",
  }
}

export function PincodeCheck({
  className,
}: {
  className?: string
}) {
  const [pin, setPin] = React.useState("")
  const [result, setResult] = React.useState<Result>({ status: "idle" })
  const [touched, setTouched] = React.useState(false)

  function onCheck() {
    setTouched(true)
    const r = checkMetroPincode(pin)
    setResult(r)
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/[^\d]/g, "").slice(0, 6)
    setPin(next)
    if (touched) {
      setResult(checkMetroPincode(next))
    }
  }

  const showHelper = result.status === "invalid" || (result.status === "valid" && pin.length === 6)

  return (
    <section className={cn("w-full rounded-lg border p-4 md:p-5", className)} aria-label="Pincode delivery checker">
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-pretty">Check delivery to your area</h3>

        <div className="flex items-center gap-2">
          <label htmlFor="pincode" className="sr-only">
            Enter 6-digit pincode
          </label>
          <Input
            id="pincode"
            inputMode="numeric"
            pattern="\d{6}"
            placeholder="Enter 6-digit pincode"
            value={pin}
            onChange={onChange}
            aria-describedby="pincode-help"
            className="max-w-[220px]"
          />
          <Button type="button" onClick={onCheck}>
            Check
          </Button>
        </div>

        {showHelper && (
          <p id="pincode-help" className={cn("text-sm", result.status === "valid" ? "text-green-600" : "text-red-600")}>
            {result.status === "valid" ? `Good news! Delivery is available in ${result.city}.` : result.reason}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Currently serving metropolitan cities: Delhi (110xxx), Mumbai (400xxx), Bengaluru (560xxx), Chennai (600xxx),
          Kolkata (700xxx), Hyderabad (500xxx), Pune (411xxx), Ahmedabad (380xxx).
        </p>
      </div>
    </section>
  )
}

export default PincodeCheck
