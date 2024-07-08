module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
   [
     'module-resolver',
     {
       alias: {
         'crypto': 'react-native-quick-crypto',
         'stream': 'readable-stream',
         'buffer': '@craftzdog/react-native-buffer',
       },
     },
   ]]
};
