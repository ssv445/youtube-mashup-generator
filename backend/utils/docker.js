const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

/**
 * Executes a docker compose command
 */
async function dockerExec(service, command) {
  const fullCommand = `docker compose exec ${service} ${command}`;
  console.log(`Executing: ${fullCommand}`);

  try {
    const { stdout, stderr } = await execPromise(fullCommand, {
      cwd: path.join(__dirname, '../..'),
    });
    return { stdout, stderr };
  } catch (error) {
    throw new Error(`Docker exec failed: ${error.message}\nStderr: ${error.stderr}`);
  }
}

/**
 * Check if Docker containers are running
 */
async function checkDockerServices() {
  try {
    await execPromise('docker compose ps', {
      cwd: path.join(__dirname, '../..'),
    });
    return true;
  } catch (error) {
    throw new Error('Docker containers are not running. Please run: docker compose up -d');
  }
}

module.exports = {
  dockerExec,
  checkDockerServices,
};
