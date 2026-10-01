// Mock for node:fs to prevent Vite from crashing over the backend shared code
export const readFileSync = () => {
    throw new Error('readFileSync is not supported in the browser');
};
export default { readFileSync };
