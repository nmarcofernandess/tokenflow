import { 
  Navbar as NextUINavbar, 
  NavbarBrand, 
  NavbarContent, 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Switch
} from "@nextui-org/react"
import { IconSun, IconMoon } from "@tabler/icons-react"
import { useState } from 'react'

export const Navbar = () => {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
  }

  return (
    <NextUINavbar maxWidth="full" position="sticky">
      <NavbarBrand>
        <h1 className="font-bold text-xl">TokenFlow</h1>
      </NavbarBrand>

      <NavbarContent justify="end">
        <Switch
          defaultSelected={isDark}
          size="lg"
          color="primary"
          startContent={<IconSun />}
          endContent={<IconMoon />}
          onChange={toggleTheme}
        />

        <Button
          isIconOnly
          variant="light"
          as="a"
          href="https://github.com/yourusername/tokenflow"
          target="_blank"
        >
          <span className="text-xl">🔗</span>
        </Button>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              size="sm"
              src="https://github.com/yourusername.png"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Logado como</p>
              <p className="font-semibold">seu@email.com</p>
            </DropdownItem>
            <DropdownItem key="settings">Configurações</DropdownItem>
            <DropdownItem key="help_and_feedback">Ajuda & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Sair
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </NextUINavbar>
  )
} 