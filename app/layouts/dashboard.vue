<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary right class="pt-5">
      <v-list>
        <h3 class="px-6 mb-3">Academic Paper to Audio</h3>
        <v-subheader class="px-6" style="text-transform: uppercase"
          >Navigation</v-subheader
        >
        <v-list-item @click.prevent nuxt exact to="/dashboard" class="px-6">
          <v-list-item-content>
            <v-list-item-title v-text="'Upload Paper'"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          @click.prevent
          nuxt
          exact
          to="/dashboard/playlist"
          class="px-6"
        >
          <v-list-item-content>
            <v-list-item-title v-text="'Playlist'"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          @click.prevent
          nuxt
          exact
          to="/dashboard/account"
          class="px-6"
        >
          <v-list-item-content>
            <v-list-item-title v-text="'Account'"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="$store.state.auth.isAdmin"
          @click.prevent
          nuxt
          exact
          to="/dashboard/admin"
          class="px-6"
        >
          <v-list-item-content>
            <v-list-item-title v-text="'Admin'"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider class="mt-6 mb-10"></v-divider>
      <div class="px-4">
        <v-btn block tile outlined @click="logout()">
          Logout
          <v-icon right>mdi-logout-variant</v-icon>
        </v-btn>
      </div>
    </v-navigation-drawer>

    <v-app-bar class="elevation-1" app dense color="deep-purple darken-1" dark>
      <v-btn id="logo" text dark large class="font-weight-bold" to="/">
        <v-icon left>mdi-headphones</v-icon>
        Academic Paper to Audio</v-btn
      >
      <!-- <p
        class="ma-0 pl-3 font-weight-bold"
        style="cursor: pointer; font-size: 1.2rem"
        @click="$router.push('/')"
      >
        <span class="hidden-md-and-down d-inline-flex align-center">
          <v-icon left>mdi-headphones</v-icon>Academic Paper to Audio</span
        >
      </p> -->
      <v-spacer></v-spacer>
      <div class="hidden-md-and-down">
        <v-btn text tile @click.prevent nuxt exact to="/dashboard">
          Upload
        </v-btn>
        <v-btn text tile @click.prevent nuxt exact to="/dashboard/playlist">
          Playlist
        </v-btn>
        <v-btn text tile @click.prevent nuxt exact to="/dashboard/account">
          Account
        </v-btn>
      </div>
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
        v-show="$vuetify.breakpoint.mdAndDown"
        :class="{ 'ml-1': $vuetify.breakpoint.mdAndUp }"
      ></v-app-bar-nav-icon>
    </v-app-bar>

    <v-main>
      <v-skeleton-loader
        v-show="authenticating"
        class="mx-6 elevation-2 mt-16"
        type="card-avatar, article, actions"
      ></v-skeleton-loader>
      <v-container
        v-show="!authenticating"
        fluid
        style="padding-bottom: 120px"
        :class="[
          'pt-12',
          {
            'px-8': $vuetify.breakpoint.mdAndUp,
            'px-2': $vuetify.breakpoint.mdAndDown,
          },
        ]"
      >
        <nuxt />
      </v-container>
    </v-main>

    <!-- <v-footer dark padless>
      <div
        class="d-flex justify-space-between align-center px-4"
        style="width: 100%"
      >
        <span>Feedback</span>
        <span class="py-2 white--text text-center body-2">
          ©Academic Paper to Audio | Design by
          <a href="https://github.com/georgehua">George Hua</a>
        </span>
      </div>
    </v-footer> -->

    <v-expand-transition>
      <v-sheet class="music-player-container elevation-4" v-show="bottomPlayer">
        <music-player></music-player>
      </v-sheet>
    </v-expand-transition>
  </v-app>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

export default {
  components: {
    Player: () => import("~/components/MusicPlayer"),
  },
  data() {
    return {
      drawer: null,
    };
  },
  computed: {
    ...mapState("dashboard", ["showPlayer"]),
    ...mapState("auth", ["authenticating"]),
    ...mapGetters("auth", ["userID"]),
    bottomPlayer: {
      get() {
        return this.showPlayer;
      },
      set(val) {
        this.setAudioPlayer(val);
      },
    },
  },
  mounted() {
    this.$store.commit("auth/CHANGE_AUTHENTICATING_STATE", false);
  },
  methods: {
    ...mapMutations("dashboard", ["setAudioPlayer"]),
    async logout() {
      this.$fire.auth.signOut().then(async () => {
        await this.$store.dispatch("auth/onAuthStateChangedAction");
        this.$router.push("/login");
      });
    },
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

<style lang="scss">
.dashboard-active-nav {
  border-left: 5px solid #1976d2;
  .v-list-item__title {
    font-weight: bold !important;
  }
}
.music-player-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 9999;
}
</style>