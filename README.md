# owc-automations

Quick osu! OAuth2-based flow to verify and associate discord users with their osu! account in a non-intrusive way, by foregoing Discord OAuth usage. 

## Usage

Simply populate the .env file with the relevant fields, set the roles that should be assigned on verification with `.verify_roles role1,role2,role_n`, and instruct players to use the `/verify` slash command to begin the verification flow.
