const axios = require('axios');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

let currentRichList = [];
let richListTimestamp = 0;
let top1kBalance = 0;
let i = 0;

async function fetchBoxesForTokenSend(tokenId, url = 'https://graphql.erg.zelcore.io', maxHeight = 100000000, previousBoxes = [], skip = 0) {
  const query = `query boxes($take: Int, $skip: Int, $tokenId: String, $spent: Boolean, $maxHeight: Int) {
    boxes(take: $take, skip: $skip, tokenId: $tokenId, spent: $spent, maxHeight: $maxHeight) {
      boxId
      address
      assets {
        tokenId
        amount
      }
    }
  }`;
  const variables = {
    spent: false,
    skip,
    take: 50, // that is maximum
    tokenId,
    maxHeight,
  };
  const data = { query, variables };
  const boxesResp = await axios.post(url, data);
  const { boxes } = boxesResp.data.data;
  const allBoxes = previousBoxes.concat(boxes);
  if (boxes.length < 50) { // well nothing to fetch
    i = 0;
    return allBoxes;
  }
  i += 1;
  console.log(`Fetching ERG utxos ${i}`);
  // fetch more boxes
  return fetchBoxesForTokenSend(tokenId, url, maxHeight, allBoxes, skip + 50);
}

async function getRichList() {
  const richList = [];
  // main chain
  const res = await axios.get('https://explorer.flux.zelcore.io/api/statistics/richest-addresses-list');
  // remove Fusion addresses
  res.data.forEach((item) => {
    if (
      item.address !== 't1Yum7okNzR5kW84dfgwqB23yy1BCcpHFPq' && item.address !== 't1Zj9vUsAMoG4M9LSy5ahDzZUmokKGXqwcT'
      && item.address !== 't1abAp9oZenibGLFuZKyUjmL6FiATTaCYaj' && item.address !== 't1SHUuYiE8UT7Hnu9Qr3QcGu3W4L55W98pU'
      && item.address !== 't1cjcLaDHkNcuXh6uoyNL7u1jx7GxvzfYAN' && item.address !== 't1ZLpyVr6hs3vAH7qKujJRpu17G3VdxAkrY'
      && item.address !== 't3ThbWogDoAjGuS6DEnmN1GWJBRbVjSUK4T') {
      const newIteam = {
        address: item.address,
        balance: item.balance,
        chain: 'main',
      };
      richList.push(newIteam);
    }
  });
  // eth chain
  const ethRes = await axios.get('https://api.ethplorer.io/getTopTokenHolders/0x720cd16b011b987da3518fbf38c3071d4f0d1495?apiKey=freekey&limit=100'); // 100 is max
  // remove Fusion addresses
  ethRes.data.holders.forEach((item) => {
    if (
      item.address !== '0x5a2387883bc5e875e09d533eef812b2da30f2615' && item.address !== '0x358b39b8e9a8631606c9c1f920875febc576618c'
      && item.address !== '0x342c34702929849b6deaa47496d211cbe4167fa5' && item.address !== '0x452f1875a62fa3c8d00956659cf609e0b7e7c4bc'
      && item.address !== '0x134e4c74c670adefdcb2476df6960d9297bc7dad' && item.address !== '0x5d5342f1626227e91655da08c774f6434c2a32ff'
      && item.address !== '0x5a2e9f076ba06bae75d2bb6586139b95055ceeb4' && item.address !== '0x634515128056aeea2b12720fa737dfeed6f354e8'
      && item.address !== '0x1b9f4e3805119de9615d821ebfd83ac57cfb10ce' && item.address !== '0xd5280eed139c6e504044ed494e3d6fbf35151c10'
      && item.address !== '0xa23702e9349fbf9939864da1245f5b358e7ef30b' && item.address !== '0x1411da99450546b00fe3d4a8ab9b43b1435df5a7'
    ) {
      const newIteam = {
        address: item.address,
        balance: Number(Number(item.balance / 1e8).toFixed(8)),
        chain: 'eth',
      };
      richList.push(newIteam);
    }
  });
  // bsc chain
  const bscRes = await axios.get('https://api.binplorer.com/getTopTokenHolders/0xaff9084f2374585879e8b434c399e29e80cce635?apiKey=freekey&limit=100'); // 100 is max
  // remove Fusion addresses
  bscRes.data.holders.forEach((item) => {
    if (
      item.address !== '0x4004755e538b77f80004b0f9b7f7df4e9793e584' && item.address !== '0x020e2caefaab2a8831f3c0e1a07cee224ab3f750'
      && item.address !== '0x8cb191750096ddc8f314c2de6ef28331503774e9' && item.address !== '0x21bc0bb66db31bf7db7e687714a2529a5680bd48'
      && item.address !== '0x9b192227da99b5a50d037b10c965609ed83c43d7' && item.address !== '0xdb7b6d92eadea6d92634b3c43a3bfe64ebc93d2d'
      && item.address !== '0x1e1f3d2517c97295f68836f154f531049a9b133a' && item.address !== '0x1d605449189c7639cb99d5dcd88ea2d252ad2207'
      && item.address !== '0xbfb2181c9480f911e288fa14b5d71f9db9795bf3' && item.address !== '0x5ccb5b5c053168b411ae0a93514089a6a6b61dab'
      && item.address !== '0x5b79692e093c70e47070f525b593cc35b5adf530' && item.address !== '0x7f91e7d572a86b6a38a7194a1d66466b7db4a776'
    ) {
      const newIteam = {
        address: item.address,
        balance: Number(Number(item.balance / 1e8).toFixed(8)),
        chain: 'bsc',
      };
      richList.push(newIteam);
    }
  });
  // remove Fusion addresses
  // tron chain
  const tronRes = await axios.get('https://api.trongrid.io/v1/contracts/TWr6yzukRwZ53HDe3bzcC8RCTbiKa4Zzb6/tokens?limit=100');
  // remove Fusion addresses
  tronRes.data.data.forEach((item) => {
    const key = Object.keys(item)[0];
    if (
      key !== 'TSHXNnsrKGf6KAfosq5mckCnaY7gUfGwBJ' && key !== 'TXU4q6hSNJVc6Gmm3FXAuUpErmqJV7ao2a'
      && key !== 'TVkT9g2zzgcztm81RozqBA1UbwzZpoN8cM' && key !== 'TGaEHz2YfuPKLVhN3Q16CDoNz9Xo91j216'
      && key !== 'TA7U2PTnHDyhHBns3X6NsDndjZDBUE3oUa' && key !== 'TCbCjacBNP9UYXLizJifw7hBgG  HgHECwJL'
      && key !== 'TNSgkA1VqiZ4KDJrVKGoy2f9TgGoNjDFWC' && key !== 'TNzPtj5QBvJzaLYSVXVNeCX4fcxg4w8njX'
      && key !== 'TGwJYVkJGEnS5mWP1SE9zaiXMQ7frCzitj' && key !== 'TTo85HF49dGLRBRPxPiRmATGqXCKvWEpRD'
      && key !== 'THV8NGvAwyaL22kkhkXHVhL7JBDyxRs3BZ' && key !== 'TTUZjC3yPCbYQqVxuzJSoTU2Q9TzQ2B2N1'
    ) {
      const newIteam = {
        address: key,
        balance: Number(Number(+item[key] / 1e8).toFixed(8)),
        chain: 'tron',
      };
      richList.push(newIteam);
    }
  });
  // solana chain
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getProgramAccounts',
    params: [
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      {
        encoding: 'jsonParsed',
        filters: [
          {
            dataSize: 165,
          },
          {
            memcmp: {
              offset: 0,
              bytes: 'FLUX1wa2GmbtSB6ZGi2pTNbVCw3zEeKnaPCkPtFXxqXe',
            },
          },
        ],
      },
    ],
  };
  const solRes = await axios.post('https://node.sol.zelcore.io', data);
  solRes.data.result.forEach((holder) => {
    if (Number(holder.account.data.parsed.info.tokenAmount.amount) > 0) {
      if (
        holder.pubkey !== '9kwyAGDpVN68vTKmGQY1gPENtYuZmBYSEse5WQxcp7g' && holder.pubkey !== '5JZmeaRTTejLYgUPV5hTJkrw7bzMMSpCxuZfdfXEgXj6'
        && holder.pubkey !== '3v8h1SQ5N4yUDYnErA44ThNa3tGSV21xfv8Wv2pvPikB' && holder.pubkey !== '7dPg9ABMuAEXdrBbxXFLQrS96SAmQ43zPxJ9kb56RG2z'
        && holder.pubkey !== '3q79qsEp9CoCpNE2poy5stVKmXqWruLdwxn5KWNHeUNk' && holder.pubkey !== '9ysCUJk4rweT35nj7GUZFKcGAUUqoaHko1jcrFLMJ34x'
        && holder.pubkey !== 'D23xnkcjnS5sjXfJpgs7945BcQLYtCfPBUPVyiAW1keM' && holder.pubkey !== '9yjw6kE8HfQ2xujfdF9rCdBCWRAaqWugDFTpb75qwfQz'
        && holder.pubkey !== 'AoWQ4uJHBFm5TgUbopxXAnvJwT3e8UiMjPd8kx3fFNDg' && holder.pubkey !== 'EaMwBRr6jTMaCEBv6DJ74cpaUZNfQXCiDoJUKteFR9tp'
        && holder.pubkey !== '8BjEKj3KYvftjDGaBgQ1uvq4Ji6Zfwm5TraHm7Xqwa3g' && holder.pubkey !== 'GXbzHTaGV4qGPzGnomfXyJnipWNLD6ao8zmBWs1MMHbm'
      ) {
        richList.push(
          {
            address: holder.pubkey,
            balance: Number(holder.account.data.parsed.info.tokenAmount.amount / (10 ** holder.account.data.parsed.info.tokenAmount.decimals)),
            chain: 'sol',
          },
        );
      }
    }
  });
  // polygon chain
  const polygonRes = await axios.get('https://polygon.blockscout.com/api?module=token&action=getTokenHolders&contractaddress=0xA2bb7A68c46b53f6BbF6cC91C865Ae247A82E99B&page=0&offset=1000');
  polygonRes.data.result.forEach((holder) => {
    if (
      holder.address !== '0x25adf2050244c087fc1a27b870844ab9c1936bdf' && holder.address !== '0x3306b1c0e668a81f3702a7a01a7400bf0cf71dc9'
      && holder.address !== '0x208ef66cd865cc9dc862baf2be796a055d973d33' && holder.address !== '0x99ec8a3eb982b5fb7b030465a64887649a8c7439'
      && holder.address !== '0x438ad183665511d41be2c779942f6c7660710be2' && holder.address !== '0x55cebc5a07bc5fd4463b8152aee2d25a5cb9097f'
      && holder.address !== '0xc7b7076ca1d7971c2e27b7c4f6493d8140c2fdd0' && holder.address !== '0x8e868e401366003d6a8f62026cc1aed4975fdbad'
      && holder.address !== '0xd6bd199e94a9ac4dc73ce4dd4c0c02c82d6cf6c2' && holder.address !== '0x6bdee8d21022323617a34e36c3a7aefb365259a4'
      && holder.address !== '0xee38530d735d485558c454268ffefe7704cc25c0' && holder.address !== '0xfcdc5338836cc7b060b166b1db7cdd4679713cef'
    ) {
      richList.push({
        address: holder.address,
        balance: Number((Number(holder.value) / 1e8).toFixed(8)),
        chain: 'pol',
      });
    }
  });
  // avax
  const avaxRes = await axios.get('https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api?module=token&action=tokenholderlist&contractaddress=0xc4B06F17ECcB2215a5DBf042C672101Fc20daF55&page=0&offset=1000');
  avaxRes.data.result.forEach((holder) => {
    if (
      holder.TokenHolderAddress !== '0x1F3b258e0ff097FC4E25B827401D10fDeAa71fC5' && holder.TokenHolderAddress !== '0xb79b5f83ed0c8b2bbf30a446c3b2da9eec42c58f'
      && holder.TokenHolderAddress !== '0x8967d37E297f6f6ede242d51783917eb07fDE293' && holder.TokenHolderAddress !== '0xdf972c65462d4ef9c4e8ec8bc90e34f3e7f28e27'
      && holder.TokenHolderAddress !== '0xe0d28bc942B7B0b9A513F92a2fCef2bdF0377619' && holder.TokenHolderAddress !== '0x80adeb7df420b4ee1fd46be7b830f8468dea86d4'
      && holder.TokenHolderAddress !== '0x2599C465F0290237954E04550dA8cf8c94644e29' && holder.TokenHolderAddress !== '0xe35f0a28392747dac23652b102a0b9bcbf8de8f6'
      && holder.TokenHolderAddress !== '0xc926CbFCbF9313E6530e3342Ee1556ce5D2c0da9' && holder.TokenHolderAddress !== '0x363a51349e301ffb5c0698be2da5656a1e79929c'
      && holder.TokenHolderAddress !== '0xBdB587D89929b3188325643800f8f789Bf72FF53' && holder.TokenHolderAddress !== '0xf57a8a5c33301a4be255b8a3cc23073fa02a37f1'
    ) {
      richList.push({
        address: holder.TokenHolderAddress,
        balance: Number((Number(holder.TokenHolderQuantity) / 1e8).toFixed(8)),
        chain: 'avax',
      });
    }
  });
  // algorand
  const url = 'https://mainnet-idx.algonode.cloud/v2/assets/1029804829/balances?limit=100000';
  const algoRes = await axios.get(url);
  algoRes.data.balances.forEach((holder) => {
    if (Number(holder.amount) > 0) {
      if (
        holder.address !== '2XAH2WI7726D5TGNXX7QBPL54PRMT4JUJZCXSAUWBJIBKC455AJ5RPEGAQ' && holder.address !== 'BM6EQ76SBF3FCXJ4SMV4ELKKQTQZVONAWBZ4FHDACFECIIWSPL2Z6QDCJI'
        && holder.address !== 'RNZZK5ZCVMOYE64EAHCABG6YRXN35SKVAW5EXKJLPZZLAIXC5NCACU22HI' && holder.address !== 'G77NS7RSGNLXEKF6O5QHH2ZSQM6ZUPABP2AWYLWUK2TKRQ5KMTSJO5L2AE'
        && holder.address !== '5MG5DOGNHGGG44HO7B4JXEORSFFLBNHFNTLYYR6OW53RNNCJK2LVSJVNXA' && holder.address !== 'MR4CKOYURBLFKZGNGLHNYVCKCLZWTJOFHMEEO3QQGDB2PQEVUYBXDWONVU'
        && holder.address !== 'V7P7W2MIGGYLYR2VFX6HH74WEA6DWP4JVJMR5RMC2T6HGEB3K4WZ6DDSCE' && holder.address !== 'P4AZBSMHG6TIVGK4ECZ6TSVAAPOACHECV2HHLUTJE5QZK7TV7CQUBD534A'
        && holder.address !== '6X2Q7AF53ESJZ7DJBEUSEGTXVRQLS6FTIZSAHKL725W6SXJOIZUNKM4IHQ' && holder.address !== 'XDTGX25AV6LS2YOSNLDIUNHDPFGTWGDVBPK5TLRC24U46HZXBKANOHNPLI'
        && holder.address !== 'X6H5CRS2TLI4M3B4BNVW3DKC6RER7ZGOLJBGDMCUFI5NKJCT4BBSUCXRW4' && holder.address !== 'YJQ62KORCDWQ3WGCSS6N75P5NDD4NQU3LYX5LYTEHUKDXO344R46G7BDQQ'
      ) {
        richList.push(
          {
            address: holder.address,
            balance: Number(holder.amount / (10 ** 8)),
            chain: 'algo',
          },
        );
      }
    }
  });
  // erg
  const tokenAddress = 'e8b20745ee9d18817305f32eb21015831a48f02d40980de6e849f886dca7f807';
  const utxosWithAsset = await fetchBoxesForTokenSend(tokenAddress);
  const holders = [];
  utxosWithAsset.forEach((utxo) => {
    const correctAsset = utxo.assets.find((asset) => asset.tokenId === tokenAddress);
    const boxAsset = +correctAsset.amount;
    const holderExists = holders.find((holder) => holder.address === utxo.address);
    if (holderExists) {
      holderExists.balance += boxAsset;
    } else {
      const holder = {
        address: utxo.address,
        balance: +correctAsset.amount,
        chain: 'erg',
      };
      holders.push(holder);
    }
  });
  // for every holder, devide the amount in string by 1e8 and convert to number
  holders.forEach((holder) => {
    // eslint-disable-next-line no-param-reassign
    holder.balance = Number((holder.balance / 1e8).toFixed(8));
  });
  // push it tou our rich list if not fusion address
  holders.forEach((holder) => {
    if (
      holder.address !== '9hhRnDa1Hih5TepwqK1Zbb8SGYUbFpqTwE9G78yffudKq59xTa9' && holder.address !== '9fR5ks1EJ6oNupggScdkyRSFp55NSdkrkP77jW7zCM9W98prnGw'
      && holder.address !== '9hZ9ygGKcQ9z1oaYQEmNF53aiNQTazhBo9DFC8tQsR47a15ueGw' && holder.address !== '9g8VEjKe3b4fhemrjUdW3ziKM5dgNHMZHkJ4mS7Y59VhHgdfD8U'
      && holder.address !== '9fCKJ7g6ZffHAQb9UQY7S6YLF6dRVejBAXw284XNazkq8XLuZbw' && holder.address !== '9fbTHsBFNVnWWfQJCoFPxW9ME3uPLT9MwtGT1MabcVQRGrmTBq4'
      && holder.address !== '9i24aAG4uG6NrPSqdWRk9PHzyxk472289F5o19KZMfXsdcbvXQf' && holder.address !== '9ejwq6F3ToUhKE6Jj8jfhj5r537XmtGBWCEj3cGNcoWqcmUN55s'
      && holder.address !== '9hfswHWqDMd2pLDRFCfxQWDTEjNwfsNSw6tweedZwuBe8z92ZyV' && holder.address !== '9gaU9MpvL2gp3xPsKzn5sRm1APEetFKHf4mG2CUaVHzkwCxyAf3'
      && holder.address !== '9gtdyNTVfziFsGzH7KNjMcUj4v8MtADx4Z3prg6MWyHCCWz9NJM' && holder.address !== '9gi1vyL2ubbJQLZavybcmDmd7HQ5qDGhRJYqa12JiYTTxNo2H37'
    ) {
      richList.push(holder);
    }
  });
  // base chain
  const baseRes = await axios.get('https://base.blockscout.com/api?module=token&action=getTokenHolders&contractaddress=0xb008bdcf9cdff9da684a190941dc3dca8c2cdd44&page=0&offset=1000');
  baseRes.data.result.forEach((holder) => {
    if (
      holder.address !== '0xdcc46899f137e7eb82437b230898dabaf3d73046' && holder.address !== '0x757405ad6a141f495162e5520686d2787d7898ba'
      && holder.address !== '0xe91b74d3c716ce77179384916f3c1700942226cc' && holder.address !== '0x9ba2092c9975a95db01e4974b4f0c05289ebd623'
      && holder.address !== '0x98f17e2d8c09f637a236d067191e0d11656a7df0' && holder.address !== '0x8080847caa6e5de0857c2b8aeefee11a14a8b5a8'
      && holder.address !== '0xe05fb97b601fb036bc7b75fcb1c8027193213af5' && holder.address !== '0xf5376f70f7f1072c00680d93f8d8282c94bb5ad6'
      && holder.address !== '0xd86292b7e8d3ca5ddc474feaf46455bfa55ae36b' && holder.address !== '0x13337dc8b591b56e8af10728494a60c294a430ce'
      && holder.address !== '0x7f5f9cd4c4c67c3f80ed74e0e1fb9e3d7975a479' && holder.address !== '0xb72ec7d7e647eaa32947b69f06255c7854b46b0b'
    ) {
      richList.push({
        address: holder.address,
        balance: Number((Number(holder.value) / 1e8).toFixed(8)),
        chain: 'base',
      });
    }
  });
  // sort based on balance from highest to lowest
  richList.sort((a, b) => b.balance - a.balance);
  const topRichList = richList.slice(0, 1000);
  // sum balances in top 1000
  top1kBalance = topRichList.reduce((acc, item) => acc + item.balance, 0);
  // limit to 1000
  return topRichList;
}

async function start() {
  try {
    const richList = await getRichList();
    if (richList) {
      console.log('Rich List refreshed');
      currentRichList = richList;
      richListTimestamp = new Date().getTime();
    }
  } catch (e) {
    console.log(e);
    log.error(`Error fetching rich list: ${e}`);
  } finally {
    setTimeout(() => {
      start();
    }, 1000 * 60 * 15); // 15 minutes
  }
}

// api express function return currentRichList
function apiRichList(req, res) {
  try {
    const resMessage = serviceHelper.createDataMessage(currentRichList);
    // add timestamp to response as header
    res.setHeader('X-RichList-Timestamp', richListTimestamp);
    res.setHeader('X-Top-1000-Balance', top1kBalance);
    res.json(resMessage);
  } catch (error) {
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
    log.error(error);
  }
}

module.exports = {
  start,
  apiRichList,
};
