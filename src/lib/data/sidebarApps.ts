/**
 * Sidebar Application Definitions
 *
 * color: RGB triple as a comma-separated string (Catppuccin Mocha palette)
 *        Stored as `r, g, b` so CSS can do `rgba(var(--app-color), 0.3)`.
 *        Hex values like "#cba6f7" would NOT work with rgba() — the rule
 *        gets silently dropped because rgba() only accepts numeric channels.
 */
export const sidebarApps = [
 { id: 'profile', icon: 'user', label: 'Profile', color: '203, 166, 247' },
 { id: 'readme', icon: 'book', label: 'README', color: '249, 226, 175' },
 { id: 'focus', icon: 'clock', label: 'Focus', color: '166, 227, 161' },
 { id: 'todos', icon: 'checkbox', label: 'Tasks', color: '137, 180, 250' },
 { id: 'games', icon: 'gamepad', label: 'Games', color: '243, 139, 168' },
 { id: 'music', icon: 'music', label: 'Music', color: '245, 194, 231' },
 { id: 'servers', icon: 'message', label: 'Servers', color: '137, 180, 250' },
 { id: 'apps', icon: 'apps', label: 'Apps', color: '148, 226, 213' },
 { id: 'terminal', icon: 'terminal', label: 'Terminal', color: '166, 227, 161' },
 { id: 'settings', icon: 'settings', label: 'Settings', color: '250, 179, 135' }
];
