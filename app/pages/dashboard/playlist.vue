<template>
  <v-container>
    <h1 class="mb-8">Playlist</h1>
    <v-row>
      <v-col
        cols="12"
        md="4"
        :class="[{ 'pr-8': $vuetify.breakpoint.mdAndUp }]"
      >
        <div :class="[{ sticky: $vuetify.breakpoint.mdAndUp }]">
          <v-text-field
            v-model="search"
            flat
            clearable
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
            class="mb-6"
          ></v-text-field>
          <!-- <v-select
            v-model="sortKeysModel"
            filled
            hide-details
            :items="sortKeys"
            prepend-inner-icon="mdi-sort"
            label="Sort by"
          ></v-select> -->
          <v-radio-group v-model="sortOptions.model">
            <template v-slot:label>
              <div>Sort By</div>
            </template>
            <v-radio
              v-for="(option, k) in sortOptions.items"
              :key="k"
              :label="option"
              :value="option"
            ></v-radio>
          </v-radio-group>
        </div>
      </v-col>
      <v-col cols="12" md="8" class="px-0 py-0" v-show="playlist">
        <v-data-iterator
          :items="playlist"
          :items-per-page.sync="itemsPerPage"
          :page="page"
          :search="search"
          :sort-by="sortBy.toLowerCase()"
          :sort-desc="sortDesc"
        >
          <template v-slot:default="props">
            <v-row>
              <v-col
                v-for="(item, track_key) in props.items"
                :key="`track_${track_key}`"
                cols="12"
              >
                <v-card class="px-0 pt-3" style="overflow: hidden">
                  <div class="px-4">
                    <h3 class="subheading font-weight-bold">
                      {{ item.paper_title }}
                    </h3>
                    <p class="grey--text body-2">{{ item.file_name }}</p>
                    <div
                      class="d-flex justify-space-between mt-1 grey--text"
                      style="font-size: 0.95rem"
                    >
                      <div class="d-md-flex justify-space-between">
                        <p>
                          Added at: {{ formatedTimestamp(item.uploaded_at) }}
                        </p>
                        <div class="d-flex" v-if="isReady(item.status)">
                          <span class="mx-2" v-if="$vuetify.breakpoint.mdAndUp"
                            >|</span
                          >
                          <p>Size: {{ item.audio_file_size }}MB</p>
                        </div>
                      </div>

                      <p
                        :class="[
                          { 'red--text text-accent-4': isFailed(item.status) },
                        ]"
                      >
                        <blink-dot
                          color="green"
                          v-show="isInProgress(item.status)"
                          style="margin-bottom: 0.1rem; margin-right: 0.1rem"
                        ></blink-dot>
                        Status:
                        {{ statusText(item.status) }}
                        <span v-show="isInProgress(item.status)">
                          ({{ progress_rank[item.status - 1] }})
                        </span>
                      </p>
                    </div>

                    <p class="body-2 grey--text" v-if="isFailed(item.status)">
                      Failed log: Lorem ipsum dolor sit, amet consectetur
                      adipisicing elit. Sit a praesentium cum tempora velit
                      dolor repellendus eligendi, pariatur ipsam beatae fugiat
                      eaque ab qui fuga ratione at, asperiores laudantium
                      doloribus.
                    </p>

                    <div
                      v-if="isReady(item.status)"
                      class="d-flex justify-space-between my-4"
                    >
                      <v-btn depressed @click="playTrack(item.id)"
                        >Play
                        <v-icon right>mdi-play</v-icon>
                      </v-btn>

                      <v-menu offset-y top left>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="grey darken-2"
                            v-bind="attrs"
                            v-on="on"
                            icon
                          >
                            <v-icon>mdi-dots-horizontal</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            link
                            :href="item.audio_download_link"
                            download="filename.mp3"
                          >
                            <v-list-item-title
                              >Download Audio</v-list-item-title
                            >
                            <v-list-item-icon>
                              <v-icon>mdi-download</v-icon>
                            </v-list-item-icon>
                          </v-list-item>
                          <v-list-item link @click="deleteTrack(item.id)">
                            <v-list-item-title>Delete</v-list-item-title>
                            <v-list-item-icon>
                              <v-icon>mdi-delete</v-icon>
                            </v-list-item-icon>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>

                    <div
                      v-if="isFailed(item.status)"
                      class="d-flex justify-space-between my-4"
                    >
                      <v-btn depressed
                        >Retry
                        <v-icon right>mdi-restart</v-icon>
                      </v-btn>
                      <v-btn depressed
                        >Delete
                        <v-icon right>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <v-progress-linear
                    v-show="isInProgress(item.status)"
                    color="teal"
                    :value="100 * (item.status / progress_rank.length)"
                  ></v-progress-linear>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="trackDeletedSnackbar"
      timeout="5000"
      color="deep-purple darken-2"
    >
      Job deleted!

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="trackDeletedSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>


<script>
import { mapState, mapMutations } from "vuex";

export default {
  layout: "dashboard",
  components: {
    BlinkDot: () => import("@/components/BlinkDot"),
  },
  data() {
    return {
      search: "",
      filter: {},
      page: 1,
      itemsPerPage: 10,
      // sortKeys: ["Newest first", "Oldest first"],
      sortKeysModel: "Newest first",
      sortOptions: {
        model: "Newest first",
        items: ["Newest first", "Oldest first"],
      },
      progress_rank: [
        "initiating",
        "extracting text",
        "converting to audio",
        "ready",
      ],
      trackDeletedSnackbar: false,
    };
  },
  computed: {
    ...mapState("dashboard", ["playlist"]),
    sortBy() {
      if (["Newest first", "Oldest first"].includes(this.sortOptions.model))
        return "uploaded_at";
    },
    sortDesc() {
      if (["Newest first"].includes(this.sortOptions.model)) return true;
      return false;
    },
  },
  methods: {
    ...mapMutations("dashboard", ["setAudioPlayer", "setPlayingTrack"]),
    isReady(index) {
      return index >= this.progress_rank.length ? true : false;
    },
    isFailed(index) {
      return index === -1 ? true : false;
    },
    isInProgress(index) {
      return !this.isReady(index) && !this.isFailed(index);
    },
    statusText(index) {
      if (this.isReady(index)) return "Ready";
      if (this.isFailed(index)) return "Failed";
      return "In progress";
    },
    playTrack(track_key) {
      console.log(track_key);

      this.setPlayingTrack(track_key);

      this.setAudioPlayer(true);
      // this.$nuxt.$emit("pause-selected-audio");
      // this.$nuxt.$emit("play-selected-audio");
    },
    formatedTimestamp(timestamp) {
      try {
        const d = new Date(parseInt(timestamp));
        const date = d.toISOString().split("T")[0];
        const time = d.toTimeString().split(" ")[0].replace(/:/g, ":");
        return `${date} ${time}`;
      } catch (e) {
        return "Invalid date";
      }
    },
    async deleteTrack(track_id) {
      let user_id = this.$store.state.auth.user.uid;

      if (user_id) {
        await this.$fire.firestore
          .doc(`users/${user_id}/paper/${track_id}`)
          .delete();
        this.trackDeletedSnackbar = true;
      }
    },
  },
};
</script>

<style lang="scss">
.sticky {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 5rem;
  z-index: 2;
}
</style>