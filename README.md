# owc-automations

Quick osu! OAuth2-based flow to verify and associate discord users with their osu! account in a non-intrusive way, by foregoing Discord OAuth usage. 

## Usage

Simply populate the .env file with the relevant fields, set the roles that should be assigned on verification with `$verify_roles role1,role2,role_n`, and instruct players to use the `/verify` slash command to begin the verification flow.

## Google Sheets configuration

This app also expects a google spreadsheet with an attached script that can provide a role-to-player mapping. An example spreadsheet can be found [here](https://docs.google.com/spreadsheets/d/1DdJ1xnO4Eb0fXA661wFBmhj6lLLrBqbhO7xXzyI9JB0/edit#gid=521202782).

### Steps:

1. Make a copy of the example spreadsheet and open the embedded script afterwards.
2. Run the `genAPIKey` function to generate an API key.
3. Open the `Project Settings` tab on the left portion of the screen (it has a gear icon when collapsed). Scroll until you find the script properties section. Copy the `apiKey` value and paste it on your .env file on the `API_KEY`field.
4. Press the Deploy button, and make a new deployment. Click on the cog and select `Web app` to deploy the spreadsheet as a web app.
5. Give it a description ("version 1.0.0", for instance). Select `Anyone` on the `Who has access` dropdown. Click on deploy.
6. Authorize the app to run using your google account. Copy the URL field it gives you (it begins with `https://script.google.com/macros/s/`). Paste the link on the `API_DEPLOYMENT_URL` field on the .env file.
7. Populate the google spreadsheet with the users you wish to verify. The roles field must contain roles that exist on the discord server, case sensitive.
