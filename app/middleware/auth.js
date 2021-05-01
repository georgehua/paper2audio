/**
 * Note: Nuxt static generated mode doesn't run middleware on initial load when hitting client side
 * Because it used to run on server, then hydrate on client side DOM, and static site doesn't have a server, 
 * so it becomes a problem if we check user auth in the middleware on initial load
 * SOLUTION: use a plugin
 */

function isProtectRoute(route) {
    return route.includes("dashboard")
}

export default function ({ app, store, redirect, route, req }) {

    // static generate side don't need server middleware
    if (process.server) return false

    // email link login don't need middleware, should be handled by plugins
    if (req && app.$fireAuth.isSignInWithEmailLink(req.url)) return false

    // console.log(`store.state.auth.user: ${store.state.auth.user}, route.name: ${route.name}`)
    store.state.auth.user == null && isProtectRoute(route.name) ? redirect('/login') : ''
    store.state.auth.user != null && route.name == 'login' ? redirect('/dashboard') : ''
}