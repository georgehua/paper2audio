# Academic Paper to Audio

[![Netlify Status](https://api.netlify.com/api/v1/badges/d4d307a8-0bb8-471c-93ac-f20d388af6a6/deploy-status)](https://app.netlify.com/sites/paper2audio/deploys)



<img src="docs/figures/favicon.svg" width="100px"/>



<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [1. About Paper2Audio](#1-about-paper2audio)
- [2. Specification](#2-specification)
  - [2.1. Machine Learning Model Design](#21-machine-learning-model-design)
  - [2.2. Application Design](#22-application-design)
    - [2.2.1. Application Architecture](#221-application-architecture)
    - [2.2.2. App Tech Stacks](#222-app-tech-stacks)
- [3. Next Step](#3-next-step)
- [4. Author](#4-author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## 1. About Paper2Audio

Numerous text-to-speech tools can read through books or pdf files, but few can handle academic literature in the market because academic writings have unique layouts. For example, there're double columns, in-line references, tables, charts, headers, and footers. The traditional TTS tools are difficult to parse and filter out those unnecessary contents. Paper2Audio is a web app that can handle those troubles. The app delivers users an easy-to-use interface to upload the papers, and listen to the converted audio in a breeze!

Paper2Audio URL: http://paper2audio.netlify.app/



## 2. Specification



### 2.1. Machine Learning Model Design

The most important part of the project is a machine learning model that is used to filter `body text` and `garbage text`. The definition of the two terms are:

- `body text`: the main content of the academic literature, the part we want to keep and convert to audio (label as 1)
- `garbage text`: the unnecessary parts that we want to discard, including header, footer, URLs, email, citations, bibliography, tables, charts, vertical layout texts, etc. (label as 0)

For achieving the goal of binary classification, the following procedures were deployed:

- Collect academic literatures from different publishers in pdf format as the data source (around 300 papers collected)
- Extract text from the pdf documents with OCR tools (Google Vision API)
- Engineered features from OCR results, such as *width and height of the paragraph*, *(x,y) coordinates of the paragraph center*, *font size*, *aspect ratio*, *if the paragraph containing URL or email*, *number of names in each paragraph*, *number of character in each paragraph*, etc. (25 features in total).
- Format OCR results and features into a structured tubular table for building the ML model, then train-test split the dataset (80%, 20%)
- Constructed a Multi-layer Perceptron Model (MLP) with Tensorflow and Keras
- Perform feature selection with Chi-square test
- Train, validate and test the model
- Improve model accuracy with hyper-parameter tuning
- Demonstrate precision and recall tradeoff (I prioritize recall because I want to include more possible positive predictions to prevent users missing body texts, on the other hand, it's more tolerable for users listening to garbage texts, because users can simply fast-forward the audio to skip the garbage texts)
- Finalize and save the model 
- Deploy the model to AWS Lambda function to serve as API endpoint for processing web request



### 2.2. Application Design

#### 2.2.1. Application Architecture

<img src="docs/figures/p2a architecture.svg"/>



#### 2.2.2. App Tech Stacks

- Frontend:
  - Vue.js
  - Nuxt.js (Static Site Generator)
  - Vuetify.js
- Backend:

  - Firebase (Firestore, Functions, Storage, Auth)
  - AWS (S3, Lambda, Polly, SNS, CloudFront)
  - Google Cloud (Cloud Function, Cloud Storage, Pub/Sub, Cloud Vision API)
- Web Hosting - Netlify
- Analytics: Google Analytics
- Version Control - Github
- CI/CD: Docker, CLI tools



## 3. Next Step

- Collect data from more publisher to include different characteristics for ML model to learn
- Design a payment system for users with a high monthly usage
- Support more languages other than English



## 4. Author

Hello, my name is George Hua, and I'm the creator of paper2audio. I'm enthusiastic about machine learning and natural language processing. If you have questions or comments toward the project, feel free to reach me with my email: [georgehua.work@gmail.com](mailto:georgehua.work@gmail.com)





