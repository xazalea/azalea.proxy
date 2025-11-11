# Azalea11 - Web Proxy

A modern, friendly web proxy application with a beautiful Lavender Sapphire Mist color palette.

## Features

- Browse the web through proxy servers
- Select from hundreds of available proxy servers from proxyscrape.com
- Modern, matte UI design with Lavender Sapphire Mist color palette
- Real-time proxy status and filtering
- Deployable on Vercel

## Color Palette

The UI uses the Lavender Sapphire Mist color palette:
- Primary: #D9A69F (Lavender), #6C739C (Sapphire)
- Accents: #F0DAD5 (Light Lavender), #C56B62 (Coral), #DEA785 (Peach)
- Neutrals: #BABBB1 (Sage Gray), #424658 (Dark Sapphire)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

This project is configured for Vercel deployment. Simply connect your repository to Vercel and deploy.

### Vercel Configuration

The project includes `vercel.json` with appropriate function timeouts for API routes.

## Usage

1. Select a proxy server from the sidebar
2. Enter the URL you want to visit
3. Click "Go" to browse through the proxy
4. The page will open in a new window

## Technical Notes

- Built with Next.js 14 and TypeScript
- Uses the proxyscrape.com API for proxy listings
- Serverless-friendly architecture for Vercel deployment

