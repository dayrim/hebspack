<?php
/*
 * Smarty plugin
 * -------------------------------------------------------------
 * File:     function.asset_loader.php
 * Type:     function
 * Name:     asset
 * -------------------------------------------------------------
 */

function smarty_function_asset_loader($params)
{

    $useCDN       = $params['cdn'] ?? false;
    $position     = $params['position'] ?? false;
    $manifestPath = $params['manifest'] ?? '';
    $paths_to_replace = isset($params['paths_to_replace']) ? $params['paths_to_replace'] : [];
    

    
    $output = [];

    if ($manifestPath) {

        $config = HeBS_Config::getInstance()->getCommon();

        $isAwsCloud = $config->get('aws.cloud.environment', false) === APPLICATION_ENV_PRODUCTION;
        $template   = 'skins/' . $config->get('skin.current') . '/';
        $baseUrl    = isset($config->resources->frontController->baseUrl) ? $config->resources->frontController->baseUrl : '/';

        $skinPath = $config->get('skin.path') . '/' . $config->get('skin.current') . '/';
   

        if (is_file($skinPath . $manifestPath)) {
            $json = json_decode(file_get_contents($skinPath . $manifestPath), true);

            if ($json) {
                $data = $json[$position] ?? [];

                foreach ($data as $key => $row) {
                    $ext = explode('.', $row['path']);
                    $ext = end($ext);

                    $isInline = $row['inline'] ?? false;

                    if (!$isInline) {
                        if ('js' === $ext) {
                            unset($data[$key]);
                            array_push($data, $row); 
                        }
                    
                    }
                }
                
                foreach ($data as $row) {
                    $ext = explode('.', $row['path']);

                    $ext = end($ext);
                  

                    $attributes = $row['attributes'];

                    $_attr = [];


                    foreach ($attributes as $v) {
                        $_attr[] = "{$v['name']}=\"{$v['value']}\"";
                    }
                    $_attributes = implode(' ', $_attr);
                    if ($_attributes) {
                        $_attributes = ' ' . $_attributes;
                    }

                    $isInline = $row['inline'] ?? false;

                    if ($isInline) {
                        
                        $content = PHP_EOL . file_get_contents($skinPath . $row['path']) . PHP_EOL;
             
                        if ('css' === $ext) {
                            
                            if ($paths_to_replace) {
                                foreach ($paths_to_replace as $search => $replace) {
                                    $content= str_replace($search, $baseUrl . $template . $replace, $content);
                                    
                                }
                            }

                            $output[] = "<style{$_attributes}>{$content}</style>";
                        } elseif ('js' === $ext) {
                            $output[] = "<script{$_attributes}>{$content}</script>";
                        }
                    } else {
                        $path = $template . $row['path'];
                        if ($isAwsCloud && $useCDN) {
                            $path = HeBS_Cloud_Frontend::getCdnBase($path, false);
                        }

                        if ('css' === $ext) {
                            $output[] = "<link rel=\"stylesheet\" href=\"{$path}\"{$_attributes}>";
                        } elseif ('js' === $ext) {
                            $output[] = "<script src=\"{$path}\"{$_attributes}></script>";
                        }
                    }
                }
            }
        }
    }

    return implode(PHP_EOL, $output);
}