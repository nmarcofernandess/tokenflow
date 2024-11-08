import { Card } from "@nextui-org/react"

export const Sidebar = () => {
  const menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '/' },
    { icon: '📤', label: 'Upload', href: '/upload' },
    { icon: '💬', label: 'Conversas', href: '/conversations' },
    { icon: '⚙️', label: 'Configurações', href: '/settings' },
    { icon: '❓', label: 'Ajuda', href: '/help' }
  ]

  return (
    <Card className="h-full w-[240px] rounded-none px-2 py-6 flex flex-col gap-2">
      {menuItems.map((item) => (
        <button
          key={item.href}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-default-100 transition-colors"
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </Card>
  )
} 