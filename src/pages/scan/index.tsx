import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { BlankLayout } from '@/layouts';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, Heading, majorScale, Pane, Paragraph } from 'evergreen-ui';
import { useRouter } from 'next/router';

function ScanPage() {
  const router = useRouter();
  const signer = async () => {
    const { accounts } = await connectWallet();
    if (checkWallet()) {
      return accounts[0];
    } else {
      const number = prompt('Select test account number');
      return accounts[parseInt(number!)];
    }
  };

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
          width="80%"
          marginBottom="40%"
          marginX="auto"
        >
          <Scanner
            onScan={async (qrCode) => {
              console.log(qrCode);
              const account = await signer();
              router.push(
                `/distribute/info/${qrCode}?address=${account.address}`
              );
            }}
          />
        </Pane>
      </Card>
    </BlankLayout>
  );
}

export default ScanPage;
