set -e

source .env.production

echo "Building app..."
npm run build

echo "Uploading to s3..."
aws s3 sync dist/ s3://sastalms.sbs --delete --profile veolms-deployer --delete

echo "Deployment completed!!!"