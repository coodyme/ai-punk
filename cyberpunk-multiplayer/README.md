# Cyberpunk Multiplayer Browser Game

## Overview
This project is a browser-based multiplayer game set in a cyberpunk-themed environment. Players can explore a futuristic neon city, engage in combat with AI-controlled robots, and interact with other players in real-time. The game is built using pure JavaScript, HTML, and CSS, with Three.js for 3D graphics and Socket.io for real-time multiplayer functionality.

## Features
- **Account System**: Players can create accounts with unique usernames and passwords.
- **Multiplayer Mode**: Interact with other players in a shared cyberpunk city.
- **Health & Stamina System**: Players have limited health and stamina that regenerates over time.
- **Inventory System**: Collect and store items, including weapons and currency.

## Controls
- **Movement**: Use WASD keys to move.
- **Run**: Hold Shift to run (uses stamina).
- **Attack**: Click the mouse to attack.
- **Jump**: Press Spacebar to jump.

## Environment
Players spawn in a vibrant cyberpunk city filled with towering skyscrapers and neon lights, reminiscent of Tokyo at night.

## Combat & Progression
- Fight AI-controlled robots to gain experience points (XP).
- Level up from 0 to 100 using XP.
- Robots drop random swords graded as Grade 1 (weak), Grade 2 (moderate), and Grade 3 (high power).
- Collect "IA Blood," the in-game currency, for trading and upgrades.

## Technical Requirements
- **3D Rendering**: Utilize Three.js for creating an immersive game environment.
- **Multiplayer**: Implement real-time interactions using Socket.io.
- **Cloud Hosting**: Deploy the game on Cloudflare Workers.
- **Database & Storage**: Use Cloudflare Storage and an SQL database for player data persistence.
- **Code Structure**: Follow SOLID principles for modular and maintainable code.

## Getting Started
1. Clone the repository.
2. Install dependencies using npm.
3. Set up the database and configure the connection in `server/config/database.js`.
4. Run the server and client applications.
5. Access the game through your web browser.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.