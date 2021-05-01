<template>
  <!-- Drop box -->
  <div
    class="dropzone"
    @dragover.prevent
    @dragleave="dragleave"
    @dragenter="dragenter"
    @drop="drop"
    ref="dropzone"
  >
    <p>
      {{ requirement }}
    </p>
    <div class="text-center">
      <!-- Box Label -->
      <slot v-if="!disableLabel"
        ><h1>{{ label || "Upload Box" }}</h1></slot
      >
      <!-- Upload Button -->
      <v-icon style="font-size: 5.5em" :color="uploadBtnColor"
        >mdi-cloud-upload-outline</v-icon
      >

      <!-- Indicate files can be dropped in here -->
      <h5 v-if="!disableHint">Drag & Drop File Here</h5>

      <p class="my-4">or</p>
      <v-btn @click="$refs.filebtn.click()"> Add File </v-btn>

      <!-- Indicate selected files -->
      <div class="input-container mt-10">
        <v-input
          v-for="file in files"
          :key="file.name"
          append-icon="mdi-close"
          @click:append="remove(file)"
          prepend-icon="mdi-file"
        >
          {{ `${file.name} (${formatBytes(file.size)})` }}
        </v-input>
      </div>
      <!-- Hidden upload button to bring up file selection dialog -->
      <input
        ref="filebtn"
        class="filebtn"
        type="file"
        :multiple="multiple"
        :accept="validatedAccept && [...validatedAccept.extensions].join(',')"
        @input="upload"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: false,
    },
    files: {
      type: Array,
      required: true,
    },
    accept: {
      type: String,
      required: false,
    },
    requirement: {
      type: String,
      required: false,
    },
    multiple: {
      type: Boolean,
      required: false,
    },
    disableLabel: {
      type: Boolean,
      required: false,
    },
    disableHint: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      hoverCounter: 0,
      hoveringContent: null,
      matchAnything: /.*/,
    };
  },
  computed: {
    uploadBtnColor() {
      return this.files.length > 0 ? "green" : "";
    },
    filebtn: {
      cache: false,
      get() {
        return this.$refs.filebtn;
      },
    },
    dropzone: {
      cache: false,
      get() {
        return this.$refs.dropzone;
      },
    },
    validTypes() {
      if (this.validatedAccept) {
        return {
          extensions: this.validatedAccept.extensions
            .map((ext) => ext.replace(/(\W)/g, "\\$1")) // Escape all potential regex tokens
            .map((rgxstr) => new RegExp(`${rgxstr}$`, "i")), // Transform into regex to look for extension
        };
      } else {
        // If we haven't been given any filters...
        return {
          extensions: [this.matchAnything],
        };
      }
    },
    validatedAccept() {
      if (this.accept) {
        return {
          extensions: this.accept
            .split(",")
            .filter((type) => type.match(/^\.(?!.*\/)/)), // Get only extension filters
        };
      } else {
        return null;
      }
    },
  },
  methods: {
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
    upload() {
      const files = this.filebtn.files ?? [];
      for (let i = 0; i < files.length; i++) {
        if (!this.multiple) {
          this.files.splice(0, this.files.length);
        }
        const shouldPush = this.validTypes.extensions.reduce(
          (prev, regex) => prev || !!files[i].name.match(regex),
          false
        );
        if (shouldPush) {
          this.files.push(files[i]);
        }
      }
      this.filebtn.value = "";
    },
    dragenter(e) {
      this.hoveringContent = e.dataTransfer.items;
      this.hoverCounter++;
    },
    /** Counts leave events (fix for event rippling issues) */
    dragleave(e) {
      this.hoverCounter--;
    },
    /** Validates and keeps track of dropped content */
    drop(e) {
      e.preventDefault(); // Keep from leaving the page
      this.hoverCounter = 0; // Content can't be dragged out, so go ahead and reset the counter
      if (e.dataTransfer.items) {
        const rejected = []; // Keeps track of rejected items for reporting at the end
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === "file") {
            // Directories are not supported. Skip any that are found
            if (e.dataTransfer.items[i].webkitGetAsEntry) {
              const entry = e.dataTransfer.items[i].webkitGetAsEntry();
              if (entry.isDirectory) {
                rejected.push(entry.name);
                continue;
              }
            }
            const file = e.dataTransfer.items[i].getAsFile();
            if (file) {
              const shouldPush = this.validTypes.extensions.reduce(
                // Check against Regex arrays from accept property
                (prev, regex) => prev || !!file.name.match(regex),
                false
              );
              if (shouldPush) {
                if (this.multiple) {
                  // Remove duplicates
                  this.files
                    .filter((currFile) => currFile.name === file.name)
                    .forEach((fileToRemove) =>
                      this.files.splice(this.files.indexOf(fileToRemove), 1)
                    );
                } else {
                  // Remove all
                  this.files.splice(0, this.files.length);
                }
                this.files.push(file);
              } else {
                rejected.push(file); // Keep track of rejected files
                continue;
              }
            } else {
              continue;
            }
          }
        }
        // Emit rejected files
        if (rejected.length) {
          this.$emit("rejectedFiles", rejected);
        }
      }
    },
    /** Removes attachment per user's request */
    remove(file) {
      const arr = this.files;
      arr.splice(arr.indexOf(file), 1);
      this.$emit("update", null);
    },
  },
  watch: {
    multiple(val) {
      if (!val) {
        this.files.splice(0, this.files.length - 1);
      }
    },
    hoveringContent(val) {
      // If a file is hovering
      if (val) {
        // If we have type checking and we're using mimetypes only
        if (
          this.accept &&
          this.accept.length &&
          this.validTypes.extensions.length === 0
        ) {
          let shouldDim = false;
          // If we found a match, dim the box
          if (shouldDim) {
            this.dropzone.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
          }
          // If not, we can't definitively typecheck, so...
        } else {
          // Check that we have a file in there
          let shouldDim = false;
          for (let i = 0; i < val.length; i++) {
            if (val[i].kind === "file") {
              shouldDim = true;
              break;
            }
          }
          // ... and dim the box
          if (shouldDim) {
            this.dropzone.style.backgroundColor = "rgba(0, 0, 0, 0.25)";
          }
        }
        // Otherwise...
      } else {
        // Un-dim the box
        this.dropzone.style.backgroundColor = "";
      }
    },
    hoverCounter(val) {
      if (val === 0) {
        this.hoveringContent = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.5em;
  font-weight: 400;
  font-family: Roboto, sans-serif;
  color: hsla(0, 0%, 100%, 0.7);
}
p {
  margin: 0;
  font-size: 0.85em;
  font-weight: 300;
}
.dropzone {
  // display: flex;
  // flex-flow: column nowrap;
  // justify-content: center;
  // align-items: center;
  padding: 10px 20px;
  border: 2px dashed hsla(0, 0%, 100%, 0.7);
  border-radius: 20px;
  overflow: hidden;
  transition: background-color 0.2s;
}
div.input-container {
  min-width: 50%;
}
.v-input {
  ::v-deep div.v-input__control {
    div.v-input__slot {
      margin-top: 4px;
      margin-bottom: 0 !important;
    }
    div.v-messages {
      display: none;
    }
  }
}
input.filebtn {
  display: none;
}
</style>