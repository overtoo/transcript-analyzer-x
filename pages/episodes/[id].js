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

function generateTimeStamps(sentences) {
  // console.table(finalArray);
  let start = 0;
  let end;
  let finalArray = [];
  let charCountTotal = 0;
  let charCountFromFixed = 0;
  let charCountAtNextFixed = 0;
  let charCountAtNextFixedBefore = 0;
  let stringIgnore = "$break$";
  let stamps = [];

  function countChinese(str) {
    const re = /[一-龥]/g;
    return ((str || "").match(re) || []).length;
  }

  function roundMe(number) {
    return Math.round(number * 10) / 10;
  }

  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].fixedTime > -1) {
      charCountFromFixed = 0;
      start = sentences[i].fixedTime;

      for (let j = i + 1; j < sentences.length; j++) {
        if (sentences[j].text != "$break$") {
          charCountAtNextFixed += countChinese(sentences[j].text);
          charCountAtNextFixedBefore += countChinese(sentences[j - 1].text);
        }
        if (sentences[j].fixedTime > -1) {
          end = sentences[j].fixedTime;
          break;
        }
      }
    }
    if (sentences[i].text != stringIgnore) {
      charCountTotal += countChinese(sentences[i].text);
      charCountFromFixed += countChinese(sentences[i].text);
    }

    let unRoundedformula =
      (charCountFromFixed / charCountAtNextFixedBefore) * (end - start) + start;

    let formula = Math.round(unRoundedformula * 10) / 10;

    if (formula) {
      stamps.push(formula);
    } else stamps.push(0);

    finalArray.push({
      ...sentences[i],
      length: countChinese(sentences[i].text),
      // charCountTotal,
      // charCountFromFixed,
      // start,
      // end,
      guessStamp: [stamps[i - 1], stamps[i]],
      guessStampString: JSON.stringify([stamps[i - 1], stamps[i]]),
      // formula,
      // charCountAtNextFixed,
      // lengthSeconds: roundMe(stamps[i] - stamps[i - 1]),
      // stamps: stamps[i],
      // charCountAtNextFixedBefore,
    });
  }

  // console.table(finalArray);
  return finalArray;
}

function generateTimeStampsOld(sentences) {
  let finalArray = [];

  let start;
  let end;
  let charSoFar;
  let charTotal;
  let stamps = [];
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].fixedTime > -1) {
      charSoFar = 0;
      charTotal = sentences[i].text.length;
      start = sentences[i].fixedTime;

      for (let j = i + 1; j < sentences.length; j++) {
        // console.log(charTotal);
        if (sentences[j].text != "$break$") {
          charTotal += sentences[j].text.length;
        } else {
          // console.log(charTotal, j, sentences[j].text);
        }
        if (sentences[j].fixedTime > -1) {
          end = sentences[j].fixedTime;
          break;
        }
      }
      // console.log(
      //   "💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚"
      // );
      // console.log(sentences[i]);
      // console.log(charTotal, start, end);
    }
    if (sentences[i].text != "$break$") {
      charSoFar += sentences[i].text.length;
      // console.log(charSoFar, i, sentences[i].text);
    }
    // console.log(sentences[i]);
    // console.log(
    //   charSoFar,
    //   charTotal,
    //   start,
    //   end,
    //   Math.round(((charSoFar / charTotal) * (end - start) + start) * 10) / 10
    // );

    if (
      Math.round(((charSoFar / charTotal) * (end - start) + start) * 10) / 10
    ) {
      stamps.push(
        Math.round(((charSoFar / charTotal) * (end - start) + start) * 10) / 10
      );
    } else stamps.push(0);

    if (i > 0) {
      finalArray[i - 1] = {
        ...sentences[i - 1],
        guessStamp: [stamps[i - 1], stamps[i]],
        guessStampString: JSON.stringify([stamps[i - 1], stamps[i]]),
        charSoFar,
        charTotal,
      };
    }
  }

  finalArray[sentences.length - 1] = {
    ...sentences[sentences.length - 1],
    guessStamp: [stamps[sentences.length - 2], stamps[sentences.length - 1]],
    guessStampString: JSON.stringify([
      stamps[sentences.length - 2],
      stamps[sentences.length - 1],
    ]),
  };

  // console.table(finalArray);
  // console.table(sentences);

  return finalArray;
}

export function Transcript3({
  sentences,
  text,
  getCurrentTime,
  setCurrentTime,
}) {
  // const sentences = cleanText(text);

  // for (const file of files) {
  //   console.log(file);
  // }

  // postData.id;

  const [genSentences, setGenSentences] = useState(
    generateTimeStamps(sentences)
  );

  return (
    <>
      <div>
        {/* {JSON.stringify(genSentences)} */}
        JSON FILE EXISTS
        {genSentences.map((item) =>
          item.text == "$break$" ? (
            <p></p>
          ) : getCurrentTime > item.guessStamp[0] &&
            getCurrentTime < item.guessStamp[1] ? (
            <Sentence
              color="red"
              senData={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          ) : (
            <Sentence
              setGenSentences={setGenSentences}
              genSentences={genSentences}
              getCurrentTime={getCurrentTime}
              setCurrentTime={setCurrentTime}
              color="black"
              senData={item}
              child={[item.guessStamp[0], getCurrentTime]}
            />
          )
        )}
      </div>
    </>
  );
}

export function Sentence({
  senData,
  color,
  getCurrentTime,
  setCurrentTime,
  setGenSentences,
  genSentences,
}) {
  function clickHandlerSentences(e, senData) {
    if (e.metaKey) {
      updateSentences(senData);
    } else {
      skipToTime(senData);
    }
  }

  function updateSentences(senData) {
    // setGenSentences(genSentences[senData.id].fixedtime);
    // setGenSentences(
    // console.log(senData.index);

    try {
      let temp = genSentences.map((item) =>
        item.index === senData.index
          ? { ...item, fixedTime: getCurrentTime }
          : item
      );
      console.log(genSentences[senData.index]);
      setGenSentences(temp);
      // console.log("set time as ");
      // console.log(temp[senData.index]);
      console.table(temp);
    } catch (e) {
      console.log("didnt set fixed time eyo");
      //add a replay thing here maybe
    }
  }

  function skipToTime(senData) {
    let timeToGo =
      senData.guessStamp[0] + Math.round(Math.random() * 100) / 10000;
    try {
      console.table(genSentences.slice(20, 40));
      setCurrentTime(timeToGo);
      console.log("jumping to " + timeToGo);
    } catch (e) {
      console.log("clicking too fast amigo.");
      //add a replay thing here maybe
    }
  }

  return (
    <p
      onClick={(e) => clickHandlerSentences(e, senData)}
      style={{ color: color }}
      guessstamp={senData.guessStamp[1]}
      key={senData.index}
      id={senData.index}
    >
      {senData.text}
      {senData.fixedTime ? `【${senData.fixedTime}】` : ""}
      {JSON.stringify(senData.guessStamp)}
    </p>
  );
}

export default function Post({ postData, allPostsData }) {
  const [getCurrentTime, setGetCurrentTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(14);
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

        {postData.transcriptExists ? (
          <Transcript3
            getCurrentTime={getCurrentTime}
            setCurrentTime={setCurrentTime}
            sentences={postData.sentences}
            text={postData.contentHtml}
          />
        ) : (
          <Transcript2
            getCurrentTime={getCurrentTime}
            text={postData.contentHtml}
          />
        )}

        {/* <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} /> */}
        {/* <div dangerouslySetInnerHTML={{ __html: transcriptData.text }} /> */}
        {/* <Transcript text={transcriptData.text} /> */}
        {/* <p>{transcriptData.text}</p> */}
        {/* <p>{postData.text}</p> */}
      </article>
    </Layout>
  );
}
