<template>
  <v-app>
    <!-- navigation -->
    <div
      style="height: 50px; position: fixed; top: 0; width: 100%; z-index: 999"
      class="deep-purple darken-1 d-flex align-center px-4"
    >
      <v-btn id="logo" text dark large class="font-weight-bold" to="/">
        <v-icon left>mdi-headphones</v-icon>
        Academic Paper to Audio</v-btn
      >
      <v-spacer></v-spacer>
      <v-btn text dark v-show="!$store.state.auth.user" to="/login"
        >Login / Register</v-btn
      >
      <v-btn text dark v-show="$store.state.auth.user" to="/dashboard"
        >dashboard</v-btn
      >
    </div>
    <!-- main content -->
    <v-container
      fluid
      style="margin-top: 50px; min-height: calc(100vh - 50px)"
      class="d-flex align-stretch pa-0"
    >
      <nuxt />
    </v-container>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("auth", ["userID"]),
  },
  watch: {
    async userID(newVal) {
      try {
        if (newVal) {
          await this.$store.dispatch("dashboard/bindPlaylist");
        } else {
          await this.$store.dispatch("dashboard/unbindPlaylist");
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>
