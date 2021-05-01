<template>
  <div>
    <h1 class="mb-4">Account</h1>
    <v-alert
      color="blue-grey"
      dark
      dense
      icon="mdi-school"
      prominent
      class="py-4"
    >
      Dear Users, this project is still under development, and I'll update the
      functionalities from time to time. I haven't limited how much you can use
      this tool, but please don't overly exhaust the credit. If you like to give
      me some feedback, please contact me with hua.prsn@gmail.com
    </v-alert>
    <ul style="list-style: none" class="mb-5 px-0 py-8">
      <li>User ID: {{ $store.state.auth.user.uid }}</li>
      <li>User Email: {{ $store.state.auth.user.email }}</li>
    </ul>
    <v-btn tile color="primary" @click="logout()">
      Logout
      <v-icon right>mdi-logout-variant</v-icon>
    </v-btn>
  </div>
</template>




<script>
export default {
  layout: "dashboard",
  data() {
    return {};
  },
  computed: {},
  methods: {
    methods: {
      async logout() {
        this.$fire.auth.signOut().then(async () => {
          await this.$store.dispatch("auth/onAuthStateChangedAction");
          this.$router.push("/login");
        });
      },
    },
  },
};
</script>