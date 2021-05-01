require('dotenv').config()
import colors from 'vuetify/es5/util/colors'

export default {

  // ======================================================================
  // Map system env props to internal env. (https://nuxtjs.org/api/configuration-env)
  // You need to create a .env file in the same folder as this nuxt.config.js
  // to set your local env variables.
  // ======================================================================
  env: {
    firebaseConfig: {
      baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.BASE_URL
    },
  },

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - paper2audio',
    title: 'Academic Paper to Audio',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: "~/plugins/login.js", mode: 'client' }
  ],

  router: {
    middleware: ["auth"]
  },

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',

  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/firebase'
  ],

  firebase: {
    // options
    config: {
      apiKey: process.env.FIREBASE_CONFIG_API_KEY || "",
      authDomain: process.env.FIREBASE_CONFIG_AUTH_DOMAIN || "",
      databaseURL: process.env.FIREBASE_CONFIG_DATABASE_URL || "",
      projectId: process.env.FIREBASE_CONFIG_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_CONFIG_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_CONFIG_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_CONFIG_APP_ID,
      measurementId: process.env.FIREBASE_CONFIG_MEASUREMENT_ID
    },
    onFirebaseHosting: false,
    services: {
      auth: {
        persistence: 'local',
        ssr: false
      },
      storage: true,
      firestore: true,
      analytics: true,

    },
    firestore: {
      enablePersistence: true
    },
    analytics: {
      collectionEnabled: true // default
    }
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
