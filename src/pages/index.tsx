import * as React from "react"
import Helmet from 'react-helmet'
import '../styles/main.scss'

import dayjs from 'dayjs'

import {
  graphql,
  PageProps,
} from 'gatsby'

import icon from '../images/icon.png'

import { Navbar } from '../components'
import { ChannelInfos } from '../data'

import { GetPostsQuery } from '../../generated/graphql-types'
import PostListItem from "../components/PostListItem"

// markup
const IndexPage: React.FC<PageProps<GetPostsQuery>> = (props) => {
  const data = props.data
  return (
    <>
      <Helmet>
        <title>えやみぐさ</title>
        <script async src="https://cse.google.com/cse.js?cx=4b57e8a4ef2a8c489"></script>
      </Helmet>
      <Navbar />
      <section className='section'>
        <div className='container'>
          <div className='columns is-vcentered'>
            <div className='column is-narrow'>
              <img src={icon} alt="Logo image" className='image is-64x64 mr-4' />
            </div>
            <div className='column'>
              <h1 className='title is-2'>
                えやみぐさ
              </h1>
              <p className='subtitle is-5'>
                技術ノートとか
              </p>
            </div>
          </div>
          <h2 className='title is-5 mb-3'>
            Search
          </h2>
          <div className="gcse-search"></div>
          <h2 className='title is-5 mb-3'>
            チャンネル
          </h2>
          <div className="content">
            <dl>
              {ChannelInfos.map((channelInfo, index) => {
                const channelData = data.posts.channels.find((channelData) => channelData.fieldValue === channelInfo.key)
                return (
                  <>
                    <dt className={index > 0 ? 'mt-4' : ''}>
                      {channelData?.totalCount > 0 ? (
                        <a href={`/channel/${channelInfo.key}/`}>
                          {channelInfo.key} {channelInfo.topPostCount ? `(${channelData?.totalCount})` : ''}
                        </a>
                      ) : (
                        <>
                          {channelInfo.key} {channelInfo.topPostCount ? '(0)' : ''}
                        </>
                      )}
                    </dt>
                    <dd>
                      {channelInfo.description}
                    </dd>
                  </>
                )
              })}
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}

export const pageQuery = graphql`
  query GetPosts {
    posts: allMdx(
      filter: {
        fields: {draft: {eq: false}}
      }
      sort: {
        fields: [frontmatter___lastModified]
        order: DESC
      }
    ) {
      edges {
        node {
          id
          slug
          parent {
            ... on File {
              sourceInstanceName
            }
          }
          frontmatter {
            title
            date
            updated
            channel
            category
            tags
          }
        }
      }

      channels: group(field: frontmatter___channel) {
        fieldValue
        totalCount
      }
    }
  }
`

export default IndexPage
