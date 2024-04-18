// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'hospital-pricing-frontend',
        script: 'server.js',
        watch: true,
        env: {
            NODE_ENV: 'production',
            PORT: 3000  // ensure this is the port your server.js is set to listen on
        }
    }]
};