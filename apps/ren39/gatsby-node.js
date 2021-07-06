/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const { introspectionQuery, graphql, printSchema } = require('gatsby/graphql');
const write = require('write');
// const { fmImagesToRelative } = require('gatsby-remark-relative-images');
const path = require('path');
const BUILDING_DETAIL = require('./src/pathTemplates').BUILDING_DETAIL;
const fillTemplate = require('./src/pathTemplates').fillTemplate;
const allowedEnvVariables = require('.env.js').allowedEnvVariables;

/**
 * Generate GraphQL schema.json file to be read by tslint
 * Thanks: https://gist.github.com/kkemple/6169e8dc16369b7c01ad7408fc7917a9
 */
exports.onPostBootstrap = async ({ store }) => {
    try {
        const { schema } = store.getState();
        const jsonSchema = await graphql(schema, introspectionQuery);
        const sdlSchema = printSchema(schema);

        write.sync('schema.json', JSON.stringify(jsonSchema.data), {});
        write.sync('schema.graphql', sdlSchema, {});

        console.log('\n\n[gatsby-plugin-extract-schema] Wrote schema\n'); // eslint-disable-line
    } catch (error) {
        console.error(
            '\n\n[gatsby-plugin-extract-schema] Failed to write schema: ',
            error,
            '\n',
        );
    }
};

const contentTypeToPageLayouts = {
    doma: './src/components/BuildingDetail/BuildingDetail.tsx',
};

const contentTypeToPath = {
    doma: BUILDING_DETAIL,
};

exports.createPages = ({ graphql, actions }) => {
    return new Promise((resolve, reject) => {
        resolve(
            graphql(`
                query CreatePagesQuery {
                    allMdx {
                        edges {
                            node {
                                id
                                fileAbsolutePath
                                frontmatter {
                                    published
                                    slug
                                }
                            }
                        }
                    }
                }
            `).then((result) => {
                if (result.errors) {
                    console.error(result.errors);
                    reject(result.errors);
                }

                const edges = result.data.allMdx.edges;
                if (!edges) {
                    return;
                }

                edges.forEach(({ node }) => {
                    const {
                        fileAbsolutePath,
                        frontmatter: { slug, published } = {},
                    } = node;

                    const match = fileAbsolutePath.match(
                        /\/content\/([^\/]+)\/([^\/]+)\//,
                    );
                    if (!match) {
                        console.warn(
                            'Was not able to parse file path structure. Skipping.',
                        );
                        return;
                    }

                    const [, contentType, fileSlug] = match;
                    const realSlug = slug || fileSlug;

                    if (!realSlug) {
                        console.warn('Entry without slug detected. Skipping.');
                        return;
                    }

                    const component = contentTypeToPageLayouts[contentType];
                    let realPath = fillTemplate(
                        contentTypeToPath[contentType],
                        { slug: realSlug },
                    );
                    if (!published) {
                        realPath = `/drafts${realPath}`;
                    }

                    if (!component) {
                        console.error(
                            `There is an entry, but I cant create a page for it. Skipping.`,
                        );
                        return;
                    }

                    actions.createPage({
                        // Encode the route
                        path: realPath,
                        // Layout for the page
                        component: path.resolve(component),
                        // Values defined here are injected into the page as props and can
                        // be passed to a GraphQL query as arguments
                        context: {
                            id: node.id,
                        },
                    });
                });
            }),
        );
    });
};

const getEnv = () => {
    const result = [];

    allowedEnvVariables.forEach((variableName) => {
        if (
            variableName in process.env &&
            process.env[variableName] !== undefined
        ) {
            result[`process.env.${variableName}`] =
                '"' + process.env[variableName] + '"';
        }
    });

    return result;
};

exports.onCreateWebpackConfig = ({
    stage,
    // rules,
    // loaders,
    plugins,
    actions,
}) => {
    actions.setWebpackConfig({
        plugins: [
            plugins.define({
                __DEV__: stage === `develop` || stage === `develop-html`,
                ...getEnv(),
            }),
        ],
        resolve: {
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            symlinks: false,
        },
    });
};
