import { GatsbyNode } from 'gatsby'
import path from 'path'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      posts: allMdx(
        filter: {fields: {draft: {eq: false}}}
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
          }
        }

        channels: group(field: frontmatter___channel) {
          fieldValue
        }

        categories: group(field: frontmatter___category) {
          fieldValue
        }

        tags: group(field: frontmatter___tags) {
          fieldValue
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
  }

  result.data.posts.edges
    .filter(({ node }) => node.parent.sourceInstanceName !== 'pages')
    .forEach(({ node }, index) => {
      const sourceInstanceName = node.parent.sourceInstanceName
      const pathPrefix = `/${sourceInstanceName}/`
      createPage({
        path: decodeURIComponent(`${pathPrefix}${node.slug}`),
        component: path.resolve(`./src/layouts/EntryPageLayout.tsx`),
        context: {
          id: node.id,
        },
      })
  })

  result.data.posts.channels.forEach(({
    fieldValue,
  }) => {
    createPage({
      path: decodeURIComponent(`channel/${fieldValue}`),
      component: path.resolve(`./src/layouts/ChannelSearchPageLayout.tsx`),
      context: {
        channel: fieldValue,
      },
    })
  })

  result.data.posts.channels.forEach(({
    fieldValue: channel,
  }) => {
    result.data.posts.categories.forEach(({
      fieldValue: category,
    }) => {
      createPage({
        path: decodeURIComponent(`channel/${channel}/category/${category}`),
        component: path.resolve(`./src/layouts/ChannelCategorySearchPageLayout.tsx`),
        context: {
          channel: channel,
          category: category,
        },
      })
    })

    result.data.posts.tags.forEach(({
      fieldValue: tag,
    }) => {
      createPage({
        path: decodeURIComponent(`channel/${channel}/tags/${tag}`),
        component: path.resolve(`./src/layouts/ChannelTagSearchPageLayout.tsx`),
        context: {
          channel: channel,
          tag: tag,
        },
      })
    })
  })

  result.data.posts.categories.forEach(({
    fieldValue,
  }) => {
    createPage({
      path: decodeURIComponent(`category/${fieldValue}`),
      component: path.resolve(`./src/layouts/CategorySearchPageLayout.tsx`),
      context: {
        category: fieldValue,
      },
    })
  })

  result.data.posts.tags.forEach(({
    fieldValue,
  }) => {
    createPage({
      path: decodeURIComponent(`tags/${fieldValue}`),
      component: path.resolve(`./src/layouts/TagSearchPageLayout.tsx`),
      context: {
        tag: fieldValue,
      },
    })
  })
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type MdxFrontmatter {
      date: String
      updated: String
      lastModified: String
    }
  `)
}

export const createResolvers: GatsbyNode['createResolvers'] = ({ createResolvers }) => {
  const resolvers = {
    MdxFrontmatter: {
      date: {
        type: 'String',
        resolve: (source) => source.date ? dayjs(source.date).tz('Asia/Tokyo').toISOString() : null
      },
      updated: {
        type: 'String',
        resolve: (source) => source.updated ? dayjs(source.updated).tz('Asia/Tokyo').toISOString() : null
      },
      lastModified: {
        type: 'String',
        resolve: (source) => source.updated ? dayjs(source.updated).tz('Asia/Tokyo').toISOString() : (source.date ? dayjs(source.date).tz('Asia/Tokyo').toISOString() : null)
      }
    }
  }
  createResolvers(resolvers)
}
