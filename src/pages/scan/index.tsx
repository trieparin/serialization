import { UserContext } from '@/contexts/UserContext';
import { auth } from '@/firebase/config';
import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { BlankLayout } from '@/layouts';
import { IDistribute, ROLE } from '@/models/distribute.model';
import Traceability from '@/Traceability.json';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { Contract } from 'ethers';
import { Card, Heading, majorScale, Pane, Paragraph } from 'evergreen-ui';
import { signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

export default function ScanPage() {
  const router = useRouter();
  const { token } = useContext(UserContext);

  const onScan = async (detected: IDetectedBarcode) => {
    try {
      // Connect to wallet eg. MetaMask
      const provider = await connectWallet();
      let signer;
      if (checkWallet()) {
        signer = await provider.getSigner();
      } else {
        const idx = parseInt(prompt('Signer account?')!);
        signer = await provider.getSigner(idx);
      }

      // Get raw distribute data
      console.log('get distribution timer');
      console.time('get distribution timer');
      const scan = detected.rawValue;
      const id = scan.replace(/\?.*/, '');
      const fch = customFetch();
      const { data }: { data: IDistribute } = await fch.get(
        `/distributes/${id}`
      );

      // Check role in smart contract and redirect
      console.log('check role with smart contract timer');
      console.time('check role with smart contract timer');
      const contract = new Contract(data.contract, Traceability.abi, signer);
      const role = parseInt(await contract.checkRole());
      switch (role) {
        case ROLE.DISTRIBUTOR:
          if (data.catalogs[signer.address]) {
            router.push(`/distribute/request/${id}?address=${signer.address}`);
          } else {
            router.push(`/distribute/confirm/${id}?address=${signer.address}`);
          }
          break;
        case ROLE.PHARMACY:
          if (data.catalogs[signer.address]) {
            router.push(`/distribute/print/${id}?address=${signer.address}`);
          } else {
            router.push(`/distribute/confirm/${id}?address=${signer.address}`);
          }
          break;
        default:
          router.push(`/distribute/info/${scan}`);
      }
      console.timeEnd('check role with smart contract timer');
      console.timeEnd('get distribution timer');
    } catch (e) {
      throw e as Error;
    }
  };

  useEffect(() => {
    if (!token) {
      const anonymous = async () => {
        await signInAnonymously(auth);
      };
      anonymous();
    }
    setCookie('token', token!, 1000 * 60 * 60);
  }, [token]);

  return (
    <BlankLayout>
      <Card
        elevation={2}
        textAlign="center"
        background="tint1"
        position="relative"
        width="40%"
        minWidth="max-content"
        padding={majorScale(5)}
      >
        <Heading
          is="h1"
          size={900}
        >
          Scan QR
        </Heading>
        <Paragraph marginY={majorScale(3)}>Scan QR code to continue</Paragraph>
        <Pane
          width="30%"
          marginX="auto"
          style={{ aspectRatio: 1 }}
        >
          <Scanner
            onScan={(detected) => onScan(detected[0])}
            sound={false}
          />
        </Pane>
      </Card>
    </BlankLayout>
  );
}
