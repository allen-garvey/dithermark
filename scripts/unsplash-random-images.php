<?php
    require_once('inc/config.php');
    require_once(INC_PATH.'unsplash-api-secret.php');

    function getRandomPhotosJson(): array{
        $unsplashApiUrl = 'https://api.unsplash.com/photos/random?featured=true&count=30&client_id='.UNSPLASH_ACCESS_KEY;
        $httpOptions = [
            //http even though we are using https
            'http'=>[
            'method'=>'GET',
            'header'=>'Accept-language: en\r\n' .
                        'Accept-Version: v1\r\n'
            ]
        ];
        $context = stream_context_create($httpOptions);
        $apiResponse = file_get_contents($unsplashApiUrl, false, $context);
        return json_decode($apiResponse, true);
    }

    function createSet(array $values): array{
        $set = [];
        foreach($values as $value){
            $set[$value] = true;
        }

        return $set;
    }

    $modifierWordsSet = createSet(['a', 'an', 'at', 'black', 'and', 'white', 'black-and-white', 'photo', 'shot', 'image', 'drone', 'of', 'to', 'by', 'with', 'on', 'in', 'is', 'into', 'the', 'close', 'up', 'down', 'view', 'seen', 'from', 'top', 'bottom', 'over', 'under', 'background', 'foreground', 'overhead', 'form', 'very', 'small', 'large', 'great', 'big', 'little', 'while', 'when']);

    function isModifierWord(string $word): bool{
        if(preg_match('/(ly|ed)$/', $word)){
            return true;
        }
        global $modifierWordsSet;
        return array_key_exists($word, $modifierWordsSet);
    }
    
    function trimModifierWords($words, $maxDescriptiveWords){
        $ret = [];
        $numDescriptiveWords = 0;
        foreach($words as $word){
            //trim modifier words from beginning of description
            $isModifier = isModifierWord($word);
            if(count($ret) === 0 && $isModifier){
                continue;
            }
            $ret[] = $word;
            if(!$isModifier){
                $numDescriptiveWords++;
                if($numDescriptiveWords === $maxDescriptiveWords){
                    return $ret;
                }
            }
        }
    
        return $ret;
    }

    function trimDescription(string $description): string{
        $maxDescriptiveWords = 4;
        $words = preg_split('/\s+/', preg_replace('/[^a-z0-9\s-]/', '', strtolower($description)));;

        if(count($words) > $maxDescriptiveWords){
            $words = trimModifierWords($words, $maxDescriptiveWords);
        }

        return implode('-', $words);
    }

    function formatRandomImageItem(array $imageItem): array{
        $ret = [
            'urls' => [
                'regular' => $imageItem['urls']['regular'],
                'small' => $imageItem['urls']['small'],
            ],
            'download' => $imageItem['links']['download_location'],
            'link' => $imageItem['links']['html'],
            'author' => [
                'name' => $imageItem['user']['name'],
                'link' => $imageItem['user']['links']['html'],
            ],
        ];
        if(!empty($imageItem['description'])){
            $ret['description'] = trimDescription($imageItem['description']);
        }

        return $ret;
    }


    echo json_encode(array_map('formatRandomImageItem', getRandomPhotosJson()), JSON_UNESCAPED_SLASHES);
    
    