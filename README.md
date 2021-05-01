# Academic Paper to Audio

[![Netlify Status](https://api.netlify.com/api/v1/badges/d4d307a8-0bb8-471c-93ac-f20d388af6a6/deploy-status)](https://app.netlify.com/sites/paper2audio/deploys)



<img src="docs/figures/favicon.svg" width="100"/>



## About the project



Numerous text-to-speech tools can read through books or pdf files, but few of them can handle academic literature. Mostly, academic writings have unique layouts. For example, there're double columns, in-line references, tables, charts, headers, and footers, which are hard for the traditional TTS tools to parse or filter out. Paper2Audio is an online app that can deal with those issues. The app delivers users an easy-to-use interface to upload and listen to the converted audio with a life-like voice. 

This repo is the source code for the Academic Paper to Audio web app's frontend. Tech stacks used in the project:

- Vue.js
- Nuxt.js (Static Site Generator)
- Vuetify.js
- Firebase (Firestore, Functions, Storage, Auth, Analytics)

Live View of the web app: http://paper2audio.netlify.app/



App Architecture

<img src="docs/figures/p2a architecture.svg"/>