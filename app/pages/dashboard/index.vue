<template>
  <v-container>
    <v-card>
      <div class="card-header">Settings</div>
      <div class="card-content">
        <p class="mb-0">Choose file type to upload</p>
        <v-item-group mandatory v-model="options.docType.model">
          <v-radio-group v-model="options.docType.model">
            <v-row>
              <v-col
                cols="12"
                md="4"
                v-for="(option, k) in options.docType.text"
                :key="k"
                style="cursor: pointer"
              >
                <v-item v-slot="{ active, toggle }" :value="option.radio_value">
                  <div
                    @click="toggle"
                    :class="[
                      'd-flex p2a-radio-box fill-height',
                      { 'p2a-radio-box--active': active },
                    ]"
                  >
                    <div>
                      <v-radio :value="option.radio_value"></v-radio>
                    </div>

                    <div>
                      <p class="body-1 font-weight-bold">
                        {{ option.header }}
                      </p>
                      <p class="body-2 grey--text text--darken-2">
                        {{ option.sub }}
                      </p>
                    </div>
                  </div>
                </v-item>
              </v-col>
            </v-row>
          </v-radio-group>
        </v-item-group>
        <p class="mb-0">TTS Provider</p>
        <v-radio-group v-model="options.ttsProvider.model">
          <v-radio
            v-for="(provider, k) in options.ttsProvider.items"
            :key="k"
            :label="provider.label"
            :value="provider.value"
          ></v-radio>
        </v-radio-group>
        <p class="mb-0">Text-to-speech voices</p>
        <v-radio-group v-model="options.voiceName.model">
          <v-radio
            v-for="(name, k) in options.voiceName.items"
            :key="k"
            :label="`${name.value} - ${name.label}`"
            :value="name.value"
          ></v-radio>
        </v-radio-group>
      </div>
    </v-card>

    <v-spacer class="my-10"></v-spacer>
    <v-card>
      <div class="card-header">Drop File</div>
      <file-drop
        :files="file"
        label="Drop here"
        :accept="acceptFormat"
        :requirement="requirement"
      ></file-drop>
    </v-card>
    <div class="text-right my-12">
      <v-btn
        color="primary"
        tile
        depressed
        @click="uploadFile"
        :loading="uploading"
        :disabled="uploading || file.length <= 0"
        x-large
        >Upload & Convert
      </v-btn>

      <v-btn
        color="primary"
        tile
        depressed
        to="/dashboard/playlist"
        v-show="firstTimeUploaded"
        x-large
        nuxt
        class="ml-8"
        >Go to Playlist
        <v-icon right>mdi-chevron-double-right</v-icon>
      </v-btn>
    </div>

    <v-snackbar
      v-model="uploadSuccessSnackbar"
      vertical
      timeout="5000"
      color="success"
    >
      Success! You can go to playlist page to view the upload

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="uploadSuccessSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
  
<script>
import { mapGetters } from "vuex";

export default {
  layout: "dashboard",
  mounted() {
    this.$fire.analytics.logEvent("page_view", {
      page_location: "https://paper2audio.netlify.app/dashboard",
      page_path: "/dashboard",
      page_title: "dashboard",
    });
  },
  components: {
    FileDrop: () => import("@/components/FileDrop"),
  },
  data: () => ({
    file: [],
    firstTimeUploaded: false,
    uploading: false,
    uploadSuccessSnackbar: false,
    options: {
      docType: {
        model: "pdf",
        text: [
          {
            header: "PDF format - Recommanded",
            sub:
              "Automatic filter out uncessary text (header, footers, references...) that are not suitable to convert to audio. The method is weak to academic writings with heavy mathmatical equations, greek letters, or other symbols that is difficult to speak.",
            radio_value: "pdf",
          },
          {
            header: "TXT format (pure text)",
            sub:
              "By using this options, the system won't filter out any given text, it's up the user to provide valid text for tts tools to convert",
            radio_value: "text",
          },
          {
            header: "TXT format (ssml)",
            sub:
              "By using this options, the system won't filter out any given text, and the tts tools will follow the specification of SSML to render audio. (Speech Synthesis Markup Language (SSML) is an XML-based markup language for speech synthesis applications. You can control the voices to word level in every details)",
            radio_value: "ssml",
          },
        ],
      },
      ttsProvider: {
        model: "polly",
        items: [
          {
            value: "polly",
            label: "AWS Polly (Recommended)",
          },
          {
            value: "wavenet",
            label: "Google WaveNet",
          },
        ],
      },
      voiceName: {
        model: "Joanna",
        items: [
          {
            value: "Joanna",
            label: "English (US), Female, Newscaster speaking styles",
          },
          {
            value: "Matthew",
            label: "English (US), Male, Newscaster speaking styles",
          },
          {
            value: "Amy",
            label: "English (British), Female, Newscaster speaking styles",
          },
          {
            value: "Olivia",
            label: "English (Australian), Female",
          },
        ],
      },
    },
  }),
  computed: {
    ...mapGetters("auth", ["userID"]),
    inputFileType() {
      return this.options.docType.model === "pdf" ? "pdf" : "txt";
    },
    acceptFormat() {
      return this.inputFileType === "pdf" ? ".pdf" : ".txt";
    },
    requirement() {
      return this.inputFileType === "pdf"
        ? "Requirement: Only .pdf documennt is supported. The file size should less than 20 MB."
        : "Requirement: Only .txt documennt is supported. The file size should less than 5 MB.";
    },
  },
  watch: {
    inputFileType(val) {
      this.file = [];
    },
  },
  methods: {
    uploadFile() {
      this.$fire.analytics.logEvent("purchase");

      const currentTime = Date.now();
      let fileName = this.file[0].name;
      let fileNameSplit = fileName.replace(/\/|-/g, "_").split(".");

      const folderName =
        fileNameSplit.slice(0, fileNameSplit.length - 1).join(".") +
        "_" +
        currentTime;

      try {
        let uploadTask = this.$fire.storage
          .ref()
          .child(`${this.$store.state.auth.user.uid}/${folderName}/${fileName}`)
          .put(this.file[0]);

        let self = this;
        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          "state_changed",
          function (snapshot) {
            self.uploading = true;

            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case self.$fireModule.storage.TaskState.PAUSED: // or 'paused'
                console.log("Upload is paused");
                break;
              case self.$fireModule.storage.TaskState.RUNNING: // or 'running'
                console.log("Upload is running");
                break;
            }
          },
          function (error) {
            // Handle unsuccessful uploads
            console.log(error);
          },
          function () {
            /***Upload succeed***/

            // empty file object
            self.file = [];

            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            let file_downloadURL = "";
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async function (downloadURL) {
                file_downloadURL = downloadURL;
                console.log("File available at", downloadURL);

                // write to firestore file info
                try {
                  await self.$fire.firestore
                    .doc(`users/${self.userID}/paper/${folderName}`)
                    .set({
                      file_name: fileName,
                      paper_title: "",
                      upload_doc_downloadURL: file_downloadURL,
                      uploaded_at: currentTime,
                      status_updated_at: currentTime,
                      status: 1,
                      doc_type: self.options.docType.model,
                      audio_file_size: "",
                      audio_stream_url: "",
                      error_log: "",
                      tts_provider: self.options.ttsProvider.model,
                      voice_id: self.options.voiceName.model,
                      voice_speed: 92,
                      language: "en",
                      request_characters: "",
                      audio_download_link: "",
                    });

                  console.log("write to firestore, Success!");
                  self.firstTimeUploaded = true;
                  self.uploading = false;
                  self.uploadSuccessSnackbar = true;
                } catch (e) {
                  alert(`Write to firestore error: ${e}`);
                  return;
                }
              });
            // this.$router.push("dashboard/playlist");
          }
        );
      } catch (e) {
        alert(`Upload error: ${e.message}`);
      }
    },
  },
};
</script>
 
 <style lang="css">
.card-header {
  font-size: 1.8rem;
  line-height: 2rem;
  font-weight: 700;
  padding: 1.9rem 2rem;
  background-color: #fafafa;
  border-bottom: 1px solid #eaeded;
}
.card-content {
  padding: 1rem 2rem;
}
.p2a-radio-box--active {
  background-color: #f1faff;
  border: 1.5px solid #00a1c9 !important;
}
.p2a-radio-box {
  border: 1.5px solid #aab7b8;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 1rem 1.5rem;
}
.v-item-group .v-input--selection-controls {
  margin-top: 0;
}
</style>