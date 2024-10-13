import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { BlankLayout } from '@/layouts';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, Heading, majorScale, Pane, Paragraph } from 'evergreen-ui';
import { useRouter } from 'next/router';

function ScanPage() {
  const router = useRouter();
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
          marginBottom={majorScale(3)}
        >
          <Scanner
            onScan={async (detected) => {
              const id = detected[0].rawValue;
              const provider = await connectWallet();
              let signer;
              if (checkWallet()) {
                signer = await provider.getSigner(0);
              } else {
                const idx = parseInt(prompt('Input test account index')!);
                signer = await provider.getSigner(idx);
              }
              router.push(`/distribute/info/${id}?address=${signer.address}`);
            }}
          />
        </Pane>
      </Card>
    </BlankLayout>
  );
}

export default ScanPage;
