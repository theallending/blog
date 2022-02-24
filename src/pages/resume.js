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
          <iframe src="https://drive.google.com/file/d/0B9OJ8XJkymIVdHdfQ29xa2k1VG8/view?usp=sharing&resourcekey=0-Jn3poTyVcgrTcBUfU2FtLQ&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>
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