import Layout from "../../components/layout";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

import { getAllPostIds, getPostData } from "../../lib/episodes";

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
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

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <section>
        <AudioPlayer
          autoPlay
          src="https://d3ctxlq1ktw2nl.cloudfront.net/staging/2021-6-12/3fc6755d-6638-686d-4571-7b30f570c532.mp3"
          onPlay={(e) => console.log("onPlay")}
          // other props here
        />
      </section>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <p>{postData.text}</p>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}
