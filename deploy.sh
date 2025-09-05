#!/bin/bash

# Set variables
IMAGE_NAME="btcpori"
CONTAINER_NAME="btcpori-container"  # Added container name for better management
SERVER_ADDRESS="mika@cervid-main"
REMOTE_PATH="/tmp/mika_images"
LOG_FILE="/tmp/btcpori_deploy.log"  # Added log file

# Function for logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Error handling
set -e  # Exit on error
trap 'log "Error occurred at line $LINENO"' ERR

log "Starting deployment process..."

# Build Docker image for AMD64 platform
log "Building Docker image for AMD64 platform..."
docker build --platform linux/amd64 -t $IMAGE_NAME .

# Create tar archive of the image
log "Creating image archive..."
docker save $IMAGE_NAME | gzip > ${IMAGE_NAME}.tar.gz

# Transfer the archive to the server using rsync over SSH with detailed progress
log "Transferring image to remote server..."
# Detect OS and use appropriate progress option
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    PROGRESS_OPT="--progress"
else
    # Linux and others
    PROGRESS_OPT="--progress=2"
fi
rsync -avz $PROGRESS_OPT ${IMAGE_NAME}.tar.gz $SERVER_ADDRESS:$REMOTE_PATH

# Execute commands on the remote server
log "Executing remote commands..."
ssh $SERVER_ADDRESS << EOF
    set -e  # Exit on error
    echo "Starting remote deployment process..."
    
    # Navigate to the directory containing the transferred archive
    cd $REMOTE_PATH
    
    # Load the Docker image from the archive
    echo "Loading Docker image..."
    docker load < ${IMAGE_NAME}.tar.gz
    
    # Stop and remove existing container if it exists
    if docker ps -a | grep -q ${CONTAINER_NAME}; then
        echo "Stopping existing container..."
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
    fi
    
    # Remove the archive file after loading
    echo "Cleaning up archive..."
    rm ${IMAGE_NAME}.tar.gz
    
    # Run the new container
    echo "Starting new container..."
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        --network proxy \
        ${IMAGE_NAME}
    
    # Verify container is running
    if ! docker ps | grep -q ${CONTAINER_NAME}; then
        echo "Error: Container failed to start!"
        exit 1
    fi
    
    echo "Remote deployment completed successfully!"
EOF

# Clean up local archive
log "Cleaning up local files..."
rm ${IMAGE_NAME}.tar.gz

log "Deployment completed successfully!"
