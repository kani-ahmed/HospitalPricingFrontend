// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'hospital-pricing-frontend',
        script: 'server.mjs',
        watch: true,
        env: {
            NODE_ENV: 'production',
            PORT: 3000  // ensure this is the port your server.mjs is set to listen on
        }
    }]
};