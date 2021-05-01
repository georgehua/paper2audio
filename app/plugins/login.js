
function isProtectRoute(route) {
    return route.includes("dashboard")
}
function toDashboard(route) {
    if (route.name === "login" || isProtectRoute(route.name)) {
        window.$nuxt.$router.push('dashboard')
    }
}

export default async function ({ store, app, route, redirect }) {


    // Confirm the link is a sign-in with email link.
    if (app.$fire.auth.isSignInWithEmailLink(window.location.href)) {

        console.info("user sigin with email link")
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        var email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            email = window.prompt('Please provide your email for confirmation');
        }

        app.$fire.auth.signInWithEmailLink(email, window.location.href)
            .then(async function (result) {

                // console.log(result)

                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');

                await store.dispatch("auth/onAuthStateChangedAction", result.user);

                // window.$nuxt.$router.push('dashboard')

                app.router.push("/dashboard");
            })
            .catch(function (error) {
                // Some error occurred, you can inspect the code: error.code
                // Common errors could be invalid email and invalid or expired OTPs.
                //console.error(`Error while checking signInWithEmailLink in store/index.js: ${error}`)
                if (error.code === 'auth/invalid-action-code') {
                    console.error("The login link is already used! Please send a new link from login page.")
                }
            });



    } else {

        // if a not logined client try to visit login or protected page
        // then we need to check with firebase auth if the one is a authUser
        // if true, then go to the protected page or login page
        // if false: then the client should stay in the login page
        await app.$fire.auth.onAuthStateChanged(async function (user) {

            if (user) {

                await store.dispatch("auth/onAuthStateChangedAction", user)

                user.getIdTokenResult().then((idTokenResult) => {
                    if (idTokenResult.claims.admin) {
                        store.commit("auth/SET_ADMIN", true)
                    } else {
                        store.commit("auth/SET_ADMIN", false)
                    }
                }).catch((error) => {
                    console.log(error);
                });

                if (route.name === "login") {
                    // store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);
                    // app.router.push("/dashboard");
                    return redirect("/dashboard")
                }

            } else {

                if (isProtectRoute(route.name)) {
                    // store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);
                    // app.router.push("/login");
                    return redirect("/login")
                }


            }

            store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);
        })

        // store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);

        // no login change
        // if (!store.state.auth.user & isProtectRoute(route.name)) {
        //     return redirect("/login")
        // }

        // Federated login redirect back
        // await app.$fire.auth.getRedirectResult().then(async function (result) {

        //     // The signed-in user info.
        //     var user = result.user;
        //     if (user) {

        //         await store.dispatch("auth/onAuthStateChangedAction", user)

        //         if (route.name === "login") {

        //             return redirect("/dashboard")
        //         }

        //     }


        // }).catch(function (error) {
        //     console.log(error)
        // });

        // store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);
    }
}