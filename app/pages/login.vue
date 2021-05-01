<template>
  <v-row class="justify-center">
    <v-col md="4" cols="12" class="d-flex align-center">
      <div style="width: 100%">
        <v-skeleton-loader
          v-show="authenticating"
          class="mx-auto elevation-2"
          max-width="300"
          type="card"
        ></v-skeleton-loader>
        <div v-show="!authenticating">
          <div id="federated-signin">
            <v-btn
              block
              large
              color="white"
              tile
              class="mb-5 pl-8 grey--text text--darken-2 font-weight-bold"
              @click="login('GoogleAuthProvider')"
            >
              <v-icon left class="mr-5" color="#4285F4">mdi-google</v-icon>
              Sign In with Google
            </v-btn>
            <!-- <v-btn
          block
          large
          color="#3b5998"
          tile
          class="mb-5 pl-8 white--text font-weight-bold"
        >
          <v-icon left class="mr-5">mdi-facebook</v-icon>
          Sign In with Facebook
        </v-btn>
        <v-btn
          block
          large
          color="#2F2F2F"
          tile
          class="mb-5 pl-8 white--text font-weight-bold"
        >
          <v-icon left class="mr-5">mdi-microsoft</v-icon>
          Sign In with Microsoft
        </v-btn>
        <v-btn
          block
          large
          color="#55acee"
          tile
          class="pl-8 white--text font-weight-bold"
        >
          <v-icon left class="mr-5">mdi-twitter</v-icon>
          Sign In with Twitter
        </v-btn> -->
          </div>

          <v-divider class="my-12"></v-divider>
          <h2 class="text-center mb-12">Email Link Login</h2>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="E-mail"
              required
              solo
              append-icon="mdi-email"
              tile
            ></v-text-field>
            <v-alert
              text
              dense
              color="teal"
              icon="mdi-email-check"
              border="left"
              v-show="sentAlert"
            >
              Login Link already sent to your mailbox! Please check your inbox
              or spam. Follow the instruction in the email to login.
            </v-alert>
            <v-btn
              color="primary"
              class="mt-6"
              block
              tile
              depressed
              @click="login('emailLink')"
              large
            >
              Send Login Link
            </v-btn>
          </v-form>
        </div>
      </div>
    </v-col>
  </v-row>
</template>


<script>
import { mapState } from "vuex";

export default {
  mounted() {
    this.$fire.analytics.logEvent("page_view", {
      page_location: "https://paper2audio.netlify.app/login",
      page_path: "/login",
      page_title: "login",
    });
  },
  data: () => ({
    valid: true,
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    sentAlert: false,
  }),
  computed: {
    ...mapState("auth", ["authenticating"]),
  },
  methods: {
    async login(method) {
      this.$fire.analytics.logEvent("login");

      const providers = {
        GoogleAuthProvider: new this.$fireModule.auth.GoogleAuthProvider(),
        FacebookAuthProvider: new this.$fireModule.auth.FacebookAuthProvider(),
        TwitterAuthProvider: new this.$fireModule.auth.TwitterAuthProvider(),
        MicroSoftAuthProvider: new this.$fireModule.auth.OAuthProvider(
          "microsoft.com"
        ),
      };

      // var actionCodeSettings = ;

      try {
        if (method === "emailLink") {
          await this.$fire.auth
            .sendSignInLinkToEmail(this.email, {
              // URL you want to redirect back to. The domain (www.example.com) for this
              // URL must be whitelisted in the Firebase Console.
              url: `${process.env.firebaseConfig.baseUrl}/dashboard`,
              // This must be true.
              handleCodeInApp: true,
            })
            .then((result) => {
              this.sentAlert = true;
              // The link was successfully sent. Inform the user.
              // Save the email locally so you don't need to ask the user for it again
              // if they open the link on the same device.
              window.localStorage.setItem("emailForSignIn", this.email);
              console.log("Login email sent!");
            })
            .catch(function (error) {
              // Handle Errors here.
              console.log(error);
            });
        } else {
          if (method === "GoogleAuthProvider") {
            providers[method].setCustomParameters({
              prompt: "select_account",
            });
          }
          this.$fire.auth.signInWithRedirect(providers[method]);
        }
      } catch (error) {
        // Some error occurred, you can inspect the code: error.code
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss">
#federated-signin {
  .v-btn__content {
    justify-content: left !important;
  }
}
</style>