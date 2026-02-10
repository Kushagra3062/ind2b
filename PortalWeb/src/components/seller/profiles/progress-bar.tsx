import type { TabType } from "@/types/profile"

interface ProgressBarProps {
  completedSteps: TabType[]
  currentStep: TabType
  totalSteps: TabType[]
}

export function ProgressBar({ completedSteps, currentStep, totalSteps }: ProgressBarProps) {
  // Calculate progress percentage
  const progress = Math.round((completedSteps.length / totalSteps.length) * 100)

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Profile Completion</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        {totalSteps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-4 h-4 rounded-full ${
                completedSteps.includes(step) ? "bg-green-600" : currentStep === step ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-xs mt-1 hidden md:block">{formatStepName(step)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatStepName(step: string): string {
  return step.charAt(0).toUpperCase() + step.slice(1)
}
