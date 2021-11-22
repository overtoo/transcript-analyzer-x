import Layout from "../../components/layout";
import Player from "../../components/player";
import Player2 from "../../components/player2";

import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import ReactDOM from "react-dom";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

import {
  getAllPostIds,
  getPostData,
  getSortedPostsData,
} from "../../lib/episodes";

//potentially move this later
import React, { useState, useEffect } from "react";

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  const allPostsData = JSON.parse(JSON.stringify(getSortedPostsData()));
  return {
    props: {
      postData,
      allPostsData,
    },
  };
}
export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export function Temporary() {
  return {
    props: {
      currentTime,
      setCurrentTime,
      getCurrentTime,
      setGetCurrentTime,
    },
  };
}

function generateTranscript(
  textOriginal,
  delimiters = ["。", "。", "！", "？"]
) {
  // let sum = 0;
  // for (let i = 0; i < text.length; i++) {
  //   if (text[i] == delimiters[0]) {
  //     sum++;
  //   }
  // }

  // var TextInsideLi = text.getElementsByTagName("p")[0].innerHTML;

  const text = textOriginal
    .replace(/<p>/g, "<p><span>")
    .replace(/<\/p>/g, "</span></p>")
    .replace(/，/g, "，</span><span>")
    .replace(/。/g, "。</span><span>")
    .replace(/？/g, "？</span><span>");
  console.log(text);

  return { text };
}

export function Transcript({ text }) {
  const [transcriptData, setTranscriptData] = useState(0);
  useEffect(() => {
    if (text) {
      setTranscriptData(generateTranscript(text));
    }
  }, [text]);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: transcriptData.text }} />
    </>
  );
}

function cleanText(text) {
  const textClean = text
    .replace(/<p>/g, "、、$break$、、")
    .replace(/<\/p>/g, "")
    .replace(/，/g, "，、、")
    .replace(/。/g, "。、、")
    .replace(/？/g, "？、、");
  const paragraphs = textClean;
  const breaks = paragraphs.split(/、、/g);
  let sentences = [];
  breaks.map((item, index) =>
    sentences.push({
      text: item,
      index: index,
      guessStamp: [
        Math.round(((15 * 60 * index) / breaks.length) * 10) / 10,
        Math.round(((15 * 60 * (index + 1)) / breaks.length) * 10) / 10,
      ],
      totalLength: textClean.length,
    })
  );
  return sentences;
}

export function Transcript2({ text, getCurrentTime }) {
  const sentences = cleanText(text);

  return (
    <>
      <div>
        {sentences.map((item) =>
          item.text == "$break$" ? (
            <p></p>
          ) : getCurrentTime > item.guessStamp[0] &&
            getCurrentTime < item.guessStamp[1] ? (
            <Sentence
              color="red"
              item={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          ) : (
            <Sentence
              color="black"
              item={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          )
        )}
      </div>
    </>
  );
}

export function Transcript3({ postData, allPostsData, getCurrentTime }) {
  // const sentences = cleanText(text);

  // for (const file of files) {
  //   console.log(file);
  // }

  // postData.id;

  // search allPostsData to find matching JSON file
  console.log(postData.id);
  console.log(
    allPostsData.find(
      (item) =>
        item.type === "json" &&
        item.id.replace(/.json/, "") === postData.id &&
        postData
    )
  );
  console.log(allPostsData);
  console.log(postData);

  const sentences = [
    { text: "", index: 0, guessStamp: 1 },
    { text: "$break$", index: 1, guessStamp: 2 },
    { text: "0:00 ", index: 2, guessStamp: 5 },
  ];

  return (
    <>
      <div>
        {JSON.stringify(allPostsData)}
        {sentences.map((item) =>
          item.text == "$break$" ? (
            <p></p>
          ) : getCurrentTime > item.guessStamp[0] &&
            getCurrentTime < item.guessStamp[1] ? (
            <Sentence
              color="red"
              item={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          ) : (
            <Sentence
              color="black"
              item={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          )
        )}
      </div>
    </>
  );
}

export function Sentence({ item, color }) {
  return (
    <span
      style={{ color: color }}
      guessstamp={item.guessStamp}
      key={item.index}
      id={item.index}
    >
      {item.text}
    </span>
  );
}

export default function Post({ postData, allPostsData }) {
  const [getCurrentTime, setGetCurrentTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <section>
        getCurrentTime
        <AudioPlayer
          autoplay
          src="https://d3ctxlq1ktw2nl.cloudfront.net/staging/2021-6-12/3fc6755d-6638-686d-4571-7b30f570c532.mp3"
          onPlay={(e) => console.log("onPlay")}
          // other props here
          defaultCurrentTime="01:10"
        />
        <Player
          currentTime={currentTime}
          setGetCurrentTime={setGetCurrentTime}
          src="https://d3ctxlq1ktw2nl.cloudfront.net/staging/2021-6-12/3fc6755d-6638-686d-4571-7b30f570c532.mp3"
        />
      </section>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        {/* <Transcript text={postData.contentHtml} /> */}
        <Transcript2
          getCurrentTime={getCurrentTime}
          text={postData.contentHtml}
        />
        <Transcript3
          getCurrentTime={getCurrentTime}
          allPostsData={allPostsData}
          postData={postData}
        />

        {/* <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} /> */}
        {/* <div dangerouslySetInnerHTML={{ __html: transcriptData.text }} /> */}
        {/* <Transcript text={transcriptData.text} /> */}
        {/* <p>{transcriptData.text}</p> */}
        {/* <p>{postData.text}</p> */}
      </article>
    </Layout>
  );
}
