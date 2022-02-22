import React from "react"
import Helmet from "react-helmet"
import { graphql } from 'gatsby'
import Layout from "../components/layout"

const PhotographyPage = ({
  data: {
    site
  },
}) => {
  return (
    <Layout>
      <Helmet>
        <title>Photography — {site.siteMetadata.title}</title>
        <meta name="description" content={"Photography"} />
      </Helmet>
      <div className="post">
          <h1 className="post-title">Photography</h1>
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