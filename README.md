# Runestone Safari

_Version 0.5.1_

[https://runestonesafari.com/](https://runestonesafari.com/)

Runestone Safari is an interactive map application that allows you to explore Swedish runestones and ancient heritage sites.

## Features

- Interactive clustering map with 6,815+ runestones
- Offline caching of runestones
- Detailed information about each runestone
- Ability to mark visited runestones (if you have account)

## Technology Stack

- Devbox and nix package manager for project setup
- React 19 with TypeScript
- React Router for routing
- MapLibre GL for interactive mapping and clustering
- Supabase for real-time PostgreSQL database and Supabase Storage for photos
- IDB for offline caching
- Tailwind CSS for styling
- Vite for fast development and building
- Cursor AI with Anthropic Claude 4 as a code assistant
- Cloudflare for hosting

## Data Sources

- [OpenFreeMap](https://openfreemap.org/) for map tiles
- [Samnordisk Runtextdatabas](https://www.uu.se/institution/nordiska/forskning/projekt/samnordisk-runtextdatabas) for runestone data
- Original SQLite database from [Rundata-net](https://www.rundata.info/)

## Roadmap

- [x] User authentication (not required)
- [ ] User profile page
- [ ] Search for runestones by name, location, or other attributes
- [x] Add runestones to visited list
- [ ] Add photo to visited runestone (forced Creative Commons license)
- [ ] Add collections of runestones, like a "Jarlabanke runestones", "Varganian runestones", "Estrid runestones"
- [ ] Add some gamification
- [ ] Add some social features
- [ ] Mobile applications for Android and iOS

## Acknowledgments

- [Vadim Frolov](https://github.com/fralik) and Sofia Pereswetoff-Morath for [runes.sqlite3](https://github.com/fralik/rundata-net/blob/master/rundatanet/static/runes/runes.sqlite3)

## License

```
Copyright (C) 2025 Denis Filonov

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```
