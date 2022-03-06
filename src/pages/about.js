import React from "react"
import Helmet from "react-helmet"
import { graphql } from 'gatsby'
import Layout from "../components/layout"

const AboutPage = ({
  data: {
    site
  },
}) => {
  return (
    <Layout>
      <Helmet>
        <title>About Me — {site.siteMetadata.title}</title>
        <meta name="description" content={"About Me" + site.siteMetadata.description} />
      </Helmet>
      <div className="post">
        <div className="post-thumbnail" style={{backgroundImage: `url('/assets/about.jpg')`, marginBottom: 0}}>
          <h1 className="post-title">About Me</h1>
        </div>
        <br/>
        Welcome to my blog!
        <br/> <br/>

        I made this website initially as a way to learn some front-end development (HTML, CSS, JS) to accompany my statistical programming background. 

        <br/> <br/>
        Wow using raw HTML absolutely sucks. I will switch to loading a Markdown file for this page instead.
      </div>

    </Layout>
  )
}
export default AboutPage
export const pageQuery = graphql`
  query AboutPageQuery{
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`