import source from '../../../locations.md?raw'

export const locations = source.match(/^\d+\. (.+)$/gm)?.map((line) => line.replace(/^\d+\. /, '')) ?? []
