import axios from "axios";
import { useEffect, useState } from "react";
import Web3 from "web3";
import {
  NFT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "./web3.config";

// 프로바이더 추가 -> 마치 메마에서 다른 생태계 네트워크 추가하는 것과 같음
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(TOKEN_ABI, TOKEN_CONTRACT_ADDRESS); // ABI와 컨트랙트 주소 연결
const NFTcontract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS); // ABI와 컨트랙트 주소 연결

function App() {
  const [account, setAccount] = useState("");
  const [mybalance, setMybalance] = useState();
  const [nftMetadata, setNftMetadata] = useState();

  // 메타마스크 연결
  const onClickAccount = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickLogOut = () => {
    setAccount("");
  };

  // 잔액조회
  const onClickBalance = async () => {
    try {
      if (!account || !contract) return;

      // 콜 함수
      const balance = await contract.methods.balanceOf(account).call();
      const totalSupply = await contract.methods.totalSupply().call();

      console.log(totalSupply, web3.utils.fromWei(totalSupply));
      setMybalance(web3.utils.fromWei(balance)); // 10^18 나누기 (/ 10**18)
    } catch (error) {
      console.error(error);
    }
  };

  // 민팅
  const onClickMint = async () => {
    try {
      const uri =
        "https://gateway.pinata.cloud/ipfs/QmXV6PgzzfBJxvhfp6PeXB7H7XktPCBcKCuXJr1uUvndwe";

      // NFT mint
      const result = await NFTcontract.methods.mintNft(uri).send({
        from: account,
      });

      if (!result.status) return;

      // // 이 지갑이 갖고있는 nft갯수 조회
      // const balanceOf = await NFTcontract.methods.balanceOf(account).call();
      // // 문자열로 들어옴

      // // 현재까지 발행된 NFT 갯수 조회
      // const tokenOfOwnerByIndex = await NFTcontract.methods
      //   .tokenOfOwnerByIndex(account, parseInt(balanceOf) - 1)
      //   .call();

      // // 방금 생성한 NFT의 메타데이터(json)을 가져옴 (사실 mintNft 와 같음)
      // const tokenURI = await NFTcontract.methods
      //   .tokenURI(tokenOfOwnerByIndex)
      //   .call();

      // // axios를 통해 메타데이터를 response에 저장
      // const response = await axios.get(tokenURI);
      const response = await axios.get(uri);

      setNftMetadata(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-red-100 min-h-screen flex justify-center items-center">
      {account ? (
        <div>
          <div className="text-main font-semibold">
            {account.substring(0, 4)}...{account.substring(account.length - 4)}
            <button className="ml-4 btn-style" onClick={onClickLogOut}>
              로그아웃
            </button>
          </div>
          <div>
            <button className="btn-style m-8" onClick={onClickBalance}>
              잔액 조회
            </button>
            {mybalance && (
              <div className="flex items-center">{mybalance} tMatic</div>
            )}
          </div>
          <div className="flex items-center mt-4">
            {nftMetadata && (
              <div className="m-4">
                <img src={nftMetadata.image} alt="NFT" />
                <div>Name: {nftMetadata.name}</div>
                <div>description: {nftMetadata.description}</div>
                <div>
                  {nftMetadata.attributes.map((v, i) => {
                    return (
                      <div key={i}>
                        <span>{v.trait_type} : </span>
                        <span>{v.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <button className="m-8 btn-style" onClick={onClickMint}>
              민팅
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-style" onClick={onClickAccount}>
          <img
            className="w-12"
            src={`${process.env.PUBLIC_URL}/images/metamask.png`}
          />
        </button>
      )}
    </div>
  );
}

export default App;
