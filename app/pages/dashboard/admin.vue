<template>
  <div v-if="$store.state.auth.isAdmin">
    <h1>Admin</h1>
    <v-card>
      <file-drop
        :files="file"
        label="Drop here"
        accept=".pdf"
        requirement="Requirement: pdf file only and less than 20MB"
      ></file-drop>
    </v-card>
    <v-btn color="primary" class="mt-4">Get prediction and text file</v-btn>
  </div>
</template>




<script>
export default {
  layout: "dashboard",
  components: {
    FileDrop: () => import("@/components/FileDrop"),
  },
  data() {
    return {
      file: [],
    };
  },
  computed: {},
  methods: {},
};
</script>