import { Card } from "@/components/ui/card"

const tasks = [
  {
    title: "Send proposal PDF to Acme",
    dueDate: "9/30/2025",
    status: "OPEN",
  },
]

export function TasksList() {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">My Tasks</h2>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{task.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{task.dueDate}</div>
              </div>
              <div className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded">{task.status}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
