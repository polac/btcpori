#!/bin/bash

# Set variables
IMAGE_NAME="btcpori"
SERVER_ADDRESS="mika@serveri"
REMOTE_PATH="/tmp/mika_images"

# Build Docker image
docker build -t $IMAGE_NAME .

# Create tar archive of the image
docker save $IMAGE_NAME | gzip > ${IMAGE_NAME}.tar.gz

# Transfer the archive to the server
scp ${IMAGE_NAME}.tar.gz $SERVER_ADDRESS:$REMOTE_PATH

# Execute commands on the remote server
ssh $SERVER_ADDRESS << EOF
    # Navigate to the directory containing the transferred archive
    cd $REMOTE_PATH
    
    # Load the Docker image from the archive
    docker load < ${IMAGE_NAME}.tar.gz
    
    # Optional: Remove the archive file after loading
    rm ${IMAGE_NAME}.tar.gz
    
    # Optional: Run the container (uncomment and modify as needed)
    # docker run -d $IMAGE_NAME
EOF

# Clean up local archive
rm ${IMAGE_NAME}.tar.gz

echo "Deployment completed successfully!"
