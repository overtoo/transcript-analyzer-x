import Head from "next/head";
import Link from "next/link";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";

import { getSortedPostsData } from "../lib/episodes";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  console.log(allPostsData);

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Episodes</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, title, date }) =>
            title ? (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/episodes/${id}`}>
                  <a>{title}</a>
                </Link>
                <br />
              </li>
            ) : (
              ""
            )
          )}
        </ul>
      </section>
    </Layout>
  );
}
