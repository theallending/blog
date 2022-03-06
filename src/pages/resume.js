import React from "react"
import Helmet from "react-helmet"
import { graphql } from 'gatsby'
import Layout from "../components/layout"

const ResumePage = ({
  data: {
    site
  },
}) => {
  return (
    <Layout>
      <Helmet>
        <title>Resume — {site.siteMetadata.title}</title>
        <meta name="description" content={"Resume of Allen Ding"} />
      </Helmet>
      <div className="post">
          <h1 className="post-title">Resume</h1>
      </div>
      <div class="pdf-container">
        <iframe src="https://drive.google.com/file/d/1hJyOZDoZGQtiLK4bwBHUCXp3q3A1DNBu/preview?resourcekey=0-Jn3poTyVcgrTcBUfU2FtLQ" width="640" height="480" allow="autoplay"></iframe>
      </div>


    </Layout>
  )
}
export default ResumePage
export const pageQuery = graphql`
  query ResumePageQuery{
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`